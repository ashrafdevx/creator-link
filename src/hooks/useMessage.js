import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// =================================================================
// MESSAGING API HOOKS - INTEGRATION SEQUENCE GUIDE
// =================================================================
// RECOMMENDED INTEGRATION ORDER:
// 1. useGetConversations (show chat list)
// 2. useGetConversationMessages (show messages in selected chat)
// 3. useSendMessage (enable sending messages)
// 4. useGetUnreadCount (for notifications badge)
// 5. useMarkMessageAsRead (mark messages as read)
// 6. useSearchMessages (search functionality)
// 7. useUploadAttachment (file uploads)
// 8. useDeleteMessage (delete functionality)
// =================================================================

// 1. GET CONVERSATIONS - Load conversation list with users
export const useGetConversations = (page = 1, limit = 20, options = {}) => {
  return useQuery({
    queryKey: ["conversations", page, limit],
    queryFn: async () => {
      const { data } = await api.get("/api/conversations", {
        params: { page, limit },
      });
      return data;
    },
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load conversations";
      toast.error(message);
    },
    ...options,
  });
};

// 2. GET CONVERSATION MESSAGES - Load messages for specific user
export const useGetConversationMessages = (userId, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ["conversation-messages", userId, page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/conversations/${userId}/messages`, {
        params: { page, limit },
      });
      return data;
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 10000, // 10 seconds (messages update frequently)
    cacheTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load messages";
      toast.error(message);
    },
  });
};

// 3. SEND MESSAGE - Send a new message to user
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData) => {

      // Validate required fields
      const { receiver_id, message_text, message_type = "text" } = messageData;
      if (!receiver_id || !message_text) {
        throw new Error("receiver_id and message_text are required");
      }

      const { data } = await api.post("/api/messages", {
        receiver_id,
        message_text,
        message_type,
        order_id: messageData.order_id || null, // Optional order context
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate conversations list to show new message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Invalidate specific conversation messages
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", variables.receiver_id],
      });

      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
    onError: (error) => {
      console.error("Message send error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send message";
      toast.error(message);
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// 4. GET UNREAD COUNT - Get total unread messages count with rate limiting
let rateLimitedUntil = 0;
const now = () => Date.now();

const getRetryAfterMs = (error) => {
  const h = error?.response?.headers?.["retry-after"];
  if (!h) return null;
  const n = Number(h);
  return Number.isFinite(n) ? n * 1000 : null;
};

const normalize = (data) => {
  if (data && typeof data === "object" && "unread_count" in data) {
    return { unread_count: Number(data.unread_count) || 0 };
  }
  if (typeof data === "number") {
    return { unread_count: data };
  }
  return { unread_count: 0 };
};

export const useGetUnreadCount = (options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      // Respect active cooldown from previous 429s
      if (now() < rateLimitedUntil) {
        throw Object.assign(new Error("RATE_LIMIT_ACTIVE"), { __rl: true });
      }

      const res = await api.get("/api/messages/unread-count");
      return normalize(res?.data);
    },
    staleTime: 5000, // 5 seconds
    cacheTime: 60000, // 1 minute
    refetchInterval: () => {
      if (!enabled) return false;
      if (now() < rateLimitedUntil) return false;
      return 60000; // 60 seconds - reduced frequency
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: (failureCount, error) => {
      if (!enabled) return false;
      const status = error?.response?.status;
      if (error?.__rl) return failureCount < 5;
      if (status === 429 || !status) return failureCount < 3;
      if (status >= 500 && status < 600) return failureCount < 3;
      return false;
    },
    retryDelay: (attempt, error) => {
      const hdr = getRetryAfterMs(error);
      if (hdr != null) return hdr;
      return Math.min(1000 * 2 ** (attempt - 1), 8000);
    },
    notifyOnChangeProps: ["data", "error", "isFetching", "isRefetching"],
    initialData: { unread_count: 0 },
    select: (data) => normalize(data),
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 429 || error?.__rl) {
        const ms = getRetryAfterMs(error) ?? 5000;
        rateLimitedUntil = now() + ms;
        // Don't spam toasts for rate limit; it auto-retries.
      } else {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch unread count";
        toast.error(message);
      }
    },
    onSuccess: () => {
      rateLimitedUntil = 0;
    },
    enabled,
  });
};

// 5. MARK MESSAGE AS READ - Optimized bulk marking
const pendingIds = new Set();
const processedIds = new Set();
let processing = false;
let lastInvalidateAt = 0;

const CHUNK_SIZE = 5;
const CHUNK_DELAY_MS = 250;
const INVALIDATE_DEBOUNCE_MS = 1000;

const subscribers = new Set();

function notifySubscribers(payload) {
  subscribers.forEach((fn) => {
    try {
      fn(payload);
    } catch {}
  });

  // Sonner notifications (non-intrusive)
  if (payload?.type === "error" && payload?.error) {
    toast.error(
      typeof payload.error === "string" ? payload.error : "Action failed"
    );
  }
  if (payload?.type === "processing") {
    // Optional info toast — comment out if too chatty:
    // toast.message(payload.value ? "Marking as read..." : "Up to date");
  }
}

async function processQueue(queryClient) {
  if (processing) return;
  processing = true;
  notifySubscribers({ type: "processing", value: true });

  try {
    if (now() < rateLimitedUntil) {
      const waitMs = Math.max(0, rateLimitedUntil - now());
      await new Promise((r) => setTimeout(r, waitMs));
    }

    while (pendingIds.size > 0) {
      const chunk = Array.from(pendingIds).slice(0, CHUNK_SIZE);
      chunk.forEach((id) => pendingIds.delete(id));

      for (const id of chunk) {
        try {
          await api.patch(`/api/messages/${id}/read`);
          processedIds.add(id);

          // Optimistic cache update
          queryClient.setQueriesData(
            { queryKey: ["conversation-messages"], exact: false },
            (old) => {
              if (!old) return old;
              if (Array.isArray(old?.messages)) {
                const updated = old.messages.map((m) =>
                  m?._id === id ? { ...m, is_read: true } : m
                );
                return { ...old, messages: updated };
              }
              if (Array.isArray(old)) {
                return old.map((m) =>
                  m?._id === id ? { ...m, is_read: true } : m
                );
              }
              return old;
            }
          );
        } catch (err) {
          const status = err?.response?.status;
          if (status === 429) {
            const ms = getRetryAfterMs(err) ?? 5000;
            rateLimitedUntil = now() + ms;
            pendingIds.add(id);
            notifySubscribers({
              type: "error",
              error:
                "Rate limited while marking messages as read. Will retry shortly.",
            });
            break;
          } else {
            notifySubscribers({
              type: "error",
              error:
                err?.response?.data?.message ||
                err?.message ||
                "Failed to mark message as read",
            });
          }
        }
      }

      await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));

      if (now() < rateLimitedUntil) {
        await new Promise((r) =>
          setTimeout(r, Math.max(0, rateLimitedUntil - now()))
        );
      }
    }
  } finally {
    processing = false;
    notifySubscribers({ type: "processing", value: false });

    const shouldInvalidate = now() - lastInvalidateAt > INVALIDATE_DEBOUNCE_MS;
    if (shouldInvalidate) {
      lastInvalidateAt = now();
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }
}

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return {
    mutate: (messageId) => {
      if (!messageId || processedIds.has(messageId)) return;
      pendingIds.add(messageId);
      processQueue(queryClient);
    },
    isLoading: processing,
  };
};

// 6. SEARCH MESSAGES - Search through messages
export const useSearchMessages = (searchQuery, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["search-messages", searchQuery, page, limit],
    queryFn: async () => {
      const { data } = await api.get("/api/messages/search", {
        params: { q: searchQuery, page, limit },
      });
      return data;
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      const message =
        error?.response?.data?.message || error?.message || "Search failed";
      toast.error(message);
    },
  });
};

// 7. UPLOAD ATTACHMENT - Upload file attachment with message
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {

      // Make sure you're calling the correct endpoint
      const { data } = await api.post("/api/messages/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add progress tracking if needed
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      });
      return data;
    },
    onSuccess: (data, formData) => {
      const receiverId = formData.get("receiver_id");

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", receiverId],
      });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      toast.success("File uploaded");
    },
    onError: (error) => {
      console.error("File upload error:", error);
      console.error("Error response:", error?.response?.data);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "File upload failed";
      toast.error(message);
    },
  });
};

// 8. DELETE MESSAGE - Delete a specific message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId) => {
      if (!messageId) {
        throw new Error("messageId is required");
      }

      const { data } = await api.delete(`/api/messages/${messageId}`);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Invalidate all conversation messages to remove deleted message
      queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });

      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      toast.success("Message deleted");
    },
    onError: (error) => {
      console.error("Message deletion error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete message";
      toast.error(message);
    },
    retry: 1,
    retryDelay: 1000,
  });
};

