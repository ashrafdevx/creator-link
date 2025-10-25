import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  DollarSign,
  Paperclip,
  X,
  Upload,
  Search,
  Download,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import CreateOfferModal from "./CreateOfferModal";
import OfferCard from "./OfferCard";
import FileAttachment from "./FileAttachment";
import OrderMessageIndicator from "./OrderMessageIndicator";
import {
  useGetConversationMessages,
  useSendMessage,
  useUploadAttachment,
  useSearchMessages,
} from "@/hooks/useMessage";

export default function ChatWindow({
  conversation,
  currentUser,
  onNewMessage,
  orderContext = null,
  gigContext = null,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const conversationUserId = conversation?.partner?._id || conversation?.userId;

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetConversationMessages(conversationUserId, 1, 50);

  const sendMessageMutation = useSendMessage();
  const uploadAttachmentMutation = useUploadAttachment();

  const { data: searchData, isLoading: isSearchLoading } = useSearchMessages(
    searchQuery,
    1,
    20
  );

  const apiMessages = messagesData?.data?.messages || messagesData?.messages || [];

  const messages = apiMessages;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (searchData?.messages) {
      setSearchResults(searchData.messages);
    }
  }, [searchData]);

  const handleFileSelect = useCallback((files) => {
    const validFiles = Array.from(files)
      .filter((file) => {
        // File size validation (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      })
      .slice(0, 5); // Max 5 files

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  }, []);

  const removeFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const formatMessageTime = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid time";
      }
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "Invalid time";
    }
  }, []);

  const otherUser = {
    _id: conversation?.partner?._id || conversation?.userId || "other-user",
    firstName: conversation?.partner?.firstName || conversation?.name?.split(" ")[0] || "User",
    lastName: conversation?.partner?.lastName || conversation?.name?.split(" ")[1] || "",
    publicName: conversation?.partner ?
      `${conversation.partner.firstName} ${conversation.partner.lastName}` :
      conversation?.name || "User",
    avatar: conversation?.partner?.avatar || conversation?.avatar || null,
    role: conversation?.partner?.role || "freelancer",
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Allow sending if there's either a message OR files
    if (!newMessage.trim() && selectedFiles.length === 0) {
      return;
    }
    if (!currentUser?.user?._id || !otherUser._id) {
      return;
    }

    setUploadProgress(0);

    try {
      if (selectedFiles.length > 0) {
        // Send files using upload attachment API
        setUploadProgress(10);

        const formData = new FormData();

        // FIXED: Use 'files' (plural) as per your Postman screenshot
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        formData.append("receiver_id", otherUser._id);
        formData.append(
          "message_text",
          newMessage.trim() || `Sent ${selectedFiles.length} file(s)`
        );

        if (orderContext?.id) {
          formData.append("order_id", orderContext.id);
        }

        setUploadProgress(50);
        await uploadAttachmentMutation.mutateAsync(formData);
        setUploadProgress(100);
      } else {
        const messageData = {
          receiver_id: otherUser._id,
          message_text: newMessage.trim(),
          message_type: "text",
        };

        if (orderContext?.id) {
          messageData.order_id = orderContext.id;
        }

        await sendMessageMutation.mutateAsync(messageData);
      }

      setNewMessage("");
      setSelectedFiles([]);
      setUploadProgress(0);

      if (onNewMessage) {
        onNewMessage(conversation);
      }

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      setUploadProgress(0);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Could not send message";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleFileDownload = useCallback((attachment) => {
    const fileUrl = attachment?.url || attachment?.file_url;
    if (!fileUrl) return;

    // Create a temporary link element to trigger download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download =
      attachment?.originalname || attachment?.filename || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleFilePreview = (e, attachment) => {
    e.preventDefault();
    e.stopPropagation();
    const fileUrl = attachment?.url || attachment?.file_url;
    if (!fileUrl) return;

    const mimeType = attachment?.mime_type || attachment?.mimetype;

    // For images, PDFs, and text files - open in new tab for preview
    if (
      mimeType?.startsWith("image/") ||
      mimeType === "application/pdf" ||
      mimeType?.startsWith("text/")
    ) {
      window.open(fileUrl, "_blank");
    } else {
      // For other file types, just download them
      handleFileDownload(attachment);
    }
  };

  const getInitials = useCallback((name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  }, []);

  const handleCreateOffer = async (offerData) => {
    try {
      // TODO: Implement offer creation API call
    } catch (error) {
      console.error("Failed to create offer:", error);
    }
  };

  if (!conversation?.userId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/20 border-2 border-dashed border-blue-400 flex items-center justify-center z-50">
          <div className="text-center text-blue-400">
            <Upload className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Drop files here to upload</p>
            <p className="text-sm">Maximum 5 files, 10MB each</p>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback className="bg-slate-700 text-white">
              {getInitials(otherUser.publicName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-white">
              {otherUser.publicName}
            </h3>
            {orderContext && (
              <p className="text-xs text-slate-400">
                Order:{" "}
                {orderContext.number ||
                  orderContext.title ||
                  (orderContext.id
                    ? `#${orderContext.id.slice(-6)}`
                    : "Order Discussion")}
              </p>
            )}
            {gigContext && (
              <p className="text-xs text-slate-400">
                Regarding gig: {gigContext.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsSearching(!isSearching)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOfferModalOpen(true)}
            className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>
      </div>

      {isSearching && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
          <div className="relative">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pr-10"
            />
            {isSearchLoading && (
              <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-slate-400" />
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 text-sm text-slate-400">
              Found {searchResults.length} results
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/30">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-64 bg-slate-700 rounded-2xl" />
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : messagesError ? (
          <div className="flex items-center justify-center text-center text-slate-400 p-8">
            <div>
              <p className="text-lg font-medium text-white mb-2">
                Error Loading Messages
              </p>
              <p>Please try refreshing the page.</p>
              <Button
                onClick={() => refetchMessages()}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          /* Display messages - FIXED sender/receiver logic */
          (isSearching && searchResults.length > 0
            ? searchResults
            : messages
          ).map((msg) => {
            // Extract sender ID - handle both object and string formats
            const senderId = msg.sender_id?._id || msg.sender_id;
            const isCurrentUserMessage = senderId === currentUser?.user?._id;
            const orderObject =
              msg.order_id && typeof msg.order_id === "object"
                ? msg.order_id
                : null;
            const orderIdValue =
              orderObject?._id ||
              (typeof msg.order_id === "string" ? msg.order_id : null);
            const orderDetails =
              orderObject ||
              (orderContext
                ? {
                    _id: orderContext.id,
                    order_number: orderContext.number,
                    title: orderContext.title,
                    status: orderContext.status,
                    order_type: orderContext.type,
                  }
                : orderIdValue
                ? { _id: orderIdValue }
                : null);

            return (
              <div
                key={msg._id || msg.message_id}
                className={`flex gap-3 ${isCurrentUserMessage ? "justify-end" : "justify-start"
                  }`}
              >
                {!isCurrentUserMessage && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={otherUser.avatar} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {getInitials(otherUser.publicName)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-md space-y-2 relative group ${isCurrentUserMessage ? "ml-auto" : ""
                    }`}
                >
                  {orderDetails && (
                    <OrderMessageIndicator
                      orderId={orderDetails._id}
                      orderNumber={orderDetails.order_number}
                      orderTitle={orderDetails.title}
                      orderStatus={orderDetails.status}
                      orderType={orderDetails.order_type}
                    />
                  )}

                  {msg.message_text && (
                    <div
                      className={`px-4 py-3 rounded-2xl ${isCurrentUserMessage
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-slate-700 text-white rounded-bl-md"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message_text}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p
                          className={`text-xs ${isCurrentUserMessage
                              ? "text-blue-200"
                              : "text-slate-400"
                            }`}
                        >
                          {formatMessageTime(msg.sent_at || msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2">
                      {msg.attachments.map((attachment, index) => (
                        <div
                          key={attachment._id || attachment.id || index}
                          className={`p-3 rounded-lg border ${isCurrentUserMessage
                              ? "bg-blue-600/20 border-blue-500/30"
                              : "bg-slate-700/50 border-slate-600"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {attachment.originalname ||
                                    attachment.filename ||
                                    "File"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {attachment.size
                                    ? `${(attachment.size / 1024).toFixed(
                                      1
                                    )} KB`
                                    : "Unknown size"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                type="button"
                                onClick={(e) =>
                                  handleFilePreview(e, attachment)
                                }
                                className="h-6 w-6 p-0 text-slate-400 hover:text-black"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFileDownload(attachment)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isCurrentUserMessage && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={currentUser?.user?.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(
                        `${currentUser?.user?.firstName} ${currentUser?.user?.lastName}`
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}

        {!isLoadingMessages && messages.length === 0 && !messagesError && (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <div className="bg-slate-700 rounded-full p-4 mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Start the conversation
            </h3>
            <p>Send a message to {otherUser.publicName} to get started.</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 space-y-3 bg-slate-800/50">
        {(uploadAttachmentMutation.isLoading ||
          sendMessageMutation.isLoading) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>
                  {uploadAttachmentMutation.isLoading
                    ? "Uploading files..."
                    : "Sending message..."}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-800/80 rounded-lg border border-slate-600">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2 w-full">
              <Paperclip className="w-3 h-3" />
              <span>Files to send ({selectedFiles.length}/5):</span>
            </div>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-slate-700 text-white text-xs px-3 py-2 rounded-md"
              >
                <span className="truncate max-w-32">{file.name}</span>
                <span className="text-slate-400">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                orderContext
                  ? "Message about this order..."
                  : gigContext
                  ? `Message about "${gigContext.title}"...`
                  : `Message ${otherUser.publicName}...`
              }
              className="min-h-[44px] max-h-32 resize-none bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pr-12"
              disabled={
                sendMessageMutation.isLoading ||
                uploadAttachmentMutation.isLoading
              }
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 top-2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
              disabled={
                selectedFiles.length >= 5 || uploadAttachmentMutation.isLoading
              }
              title={
                selectedFiles.length >= 5
                  ? "Maximum 5 files allowed"
                  : "Attach files"
              }
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,video/mp4,video/mpeg,video/quicktime,audio/mpeg,audio/wav"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          <Button
            type="submit"
            disabled={
              sendMessageMutation.isLoading ||
              uploadAttachmentMutation.isLoading ||
              (!newMessage.trim() && selectedFiles.length === 0)
            }
            className="bg-blue-600 hover:bg-blue-700 px-4 h-11"
          >
            {sendMessageMutation.isLoading ||
              uploadAttachmentMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {orderContext && (
          <OrderMessageIndicator
            orderId={orderContext.id}
            orderNumber={orderContext.number}
            orderTitle={orderContext.title}
            orderStatus={orderContext.status}
            orderType={orderContext.type}
            className="mt-3"
          />
        )}

        {gigContext && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-400 border-green-500/30"
            >
              Gig Discussion
            </Badge>
            <span>Discussing: "{gigContext.title}"</span>
          </div>
        )}
      </div>

      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onOfferCreated={handleCreateOffer}
        conversation={conversation}
        currentUser={currentUser}
      />
    </div>
  );
}
