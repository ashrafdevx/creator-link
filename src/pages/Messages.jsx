import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import MessageSearch from "../components/messaging/MessageSearch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, X, Loader2, RefreshCw } from "lucide-react";
import { useGetConversations, useGetUnreadCount } from "@/hooks/useMessage";
import { useAuth } from "@/hooks/useAuth";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [orderContext, setOrderContext] = useState(null);
  const [gigContext, setGigContext] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Auth hook
  const { isSignedIn, isLoading: isAuthLoading, user: currentUser } = useAuth();

  // API hooks
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useGetConversations(1, 50, {
    enabled: isSignedIn && !!currentUser && !isAuthLoading,
  });

  const {
    data: unreadData,
    isLoading: isLoadingUnread,
    error: unreadError,
    refetch: refetchUnread,
  } = useGetUnreadCount({
    enabled: isSignedIn && !!currentUser && !isAuthLoading,
  });

  const conversations = conversationsData?.conversations || [];
  const unreadCount = unreadData?.unread_count || 0;

  // Mock conversations for testing when API fails
  const mockConversations = [
    {
      _id: "mock-1",
      userId: "user-123",
      name: "John Doe",
      avatar: null,
      last_message: {
        message_text: "Hey! How's the project going?",
        sent_at: new Date(Date.now() - 3600000).toISOString(),
        message_type: "text",
        sender_id: "user-123",
      },
      unread_count: 2,
      is_online: true,
      has_order: false,
    },
    {
      _id: "mock-2",
      userId: "user-456",
      name: "Sarah Wilson",
      avatar: null,
      last_message: {
        message_text: "I've sent you the updated designs",
        sent_at: new Date(Date.now() - 7200000).toISOString(),
        message_type: "file",
        sender_id: currentUser?.user?._id || "current-user",
      },
      unread_count: 0,
      is_online: false,
      has_order: true,
    },
  ];

  // Use mock data if no conversations and there's an error
  const displayConversations =
    conversations.length > 0
      ? conversations
      : conversationsError && isSignedIn
      ? mockConversations
      : [];

  // Handle URL parameters for direct conversation access
  useEffect(() => {
    const initialize = async () => {
      if (!currentUser || isLoadingConversations) return;

      try {
        const searchParams = new URLSearchParams(location.search);
        const conversationIdFromUrl = searchParams.get("conversation_id");
        const orderIdFromUrl = searchParams.get("order_id");
        const gigIdFromUrl = searchParams.get("gig_id");
        const gigTitleFromUrl = searchParams.get("gig_title");

        // Load order context if provided
        if (orderIdFromUrl) {
          const orderInfo = {
            id: orderIdFromUrl,
            number: null,
            title: "Order Discussion",
            status: null,
            type: null,
          };
          setOrderContext(orderInfo);
        }

        // Load gig context if provided
        if (gigIdFromUrl && gigTitleFromUrl) {
          const gigContextInfo = {
            id: gigIdFromUrl,
            title: decodeURIComponent(gigTitleFromUrl),
            type: "gig",
          };
          setGigContext(gigContextInfo);
        }

        // Handle direct conversation access
        if (conversationIdFromUrl) {

          if (conversations.length > 0) {
            const targetConversation = conversations.find(
              (conv) =>
                conv._id === conversationIdFromUrl ||
                conv.userId === conversationIdFromUrl ||
                conv.partner?._id === conversationIdFromUrl
            );

            if (targetConversation) {
              setSelectedConversation(targetConversation);

              if (targetConversation.order) {
                const orderInfo = {
                  id: targetConversation.order._id,
                  number: targetConversation.order.order_number,
                  title: targetConversation.order.title,
                  status: targetConversation.order.status,
                  type: targetConversation.order.order_type,
                };
                setOrderContext(orderInfo);
              } else {
                setOrderContext(null);
              }
            } else {
              // Create a more realistic placeholder conversation
              const placeholderConversation = {
                _id: `new-${conversationIdFromUrl}`,
                userId: conversationIdFromUrl,
                name: "New Conversation",
                avatar: null,
                last_message: null,
                unread_count: 0,
                is_online: false,
                has_order: false,
                isNewConversation: true 
              };
              setSelectedConversation(placeholderConversation);
              setOrderContext(null);
            }
          } else if (!isLoadingConversations) {
            // No conversations found and not loading - create placeholder
            const placeholderConversation = {
              _id: `new-${conversationIdFromUrl}`,
              userId: conversationIdFromUrl,
              name: "New Conversation",
              avatar: null,
              last_message: null,
              unread_count: 0,
              is_online: false,
              has_order: false,
              isNewConversation: true
            };
            setSelectedConversation(placeholderConversation);
            setOrderContext(null);
          }

          // Don't clean up URL parameters immediately - let user navigate away naturally
          // setTimeout(() => {
          //   if (location.search.includes('conversation_id')) {
          //     navigate(location.pathname, { replace: true });
          //   }
          // }, 1000);
        }
      } catch (error) {
        console.error("Failed to initialize from URL params:", error);
      }
    };

    initialize();
  }, [
    location.search,
    navigate,
    currentUser,
    conversations,
    isLoadingConversations,
  ]);

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setIsSearchMode(false);

    // Load order info if conversation has order
    if (conversation.has_order || conversation.order) {
      try {
        if (conversation.order) {
          const orderInfo = {
            id: conversation.order._id,
            number: conversation.order.order_number,
            title: conversation.order.title,
            status: conversation.order.status,
            type: conversation.order.order_type,
          };
          setOrderContext(orderInfo);
        } else {
          const fallbackOrderInfo = {
            id: "order-context",
            number: null,
            title: "Order Discussion",
            status: null,
            type: null,
          };
          setOrderContext(fallbackOrderInfo);
        }
      } catch (error) {
        console.error("Failed to load order info:", error);
        setOrderContext(null);
      }
    } else {
      setOrderContext(null);
    }

    // Don't clear gig context if it was set from URL params
    // Only clear it if manually selecting a different conversation
    const searchParams = new URLSearchParams(location.search);
    const hasGigContext = searchParams.get('gig_id');

    if (!hasGigContext && gigContext) {
      // Only clear if we had gig context but no longer have URL params
      setGigContext(null);
    }
  };

  // Handle new message callback
  const onNewConversationMessage = async (updatedConversation) => {

    try {
      // Refetch conversations to get updated data
      await refetchConversations();

      // Refetch unread count
      await refetchUnread();

      // Update selected conversation to reflect changes
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    } catch (error) {
      console.error("Failed to refresh after new message:", error);
    }
  };

  // Handle search query change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (!isSearchMode) {
      setSearchQuery("");
    }
  };

  // Handle retry for failed operations
  const handleRetryAll = async () => {
    try {
      await Promise.all([refetchConversations(), refetchUnread()]);
    } catch (error) {
      console.error("Retry failed:", error);
    }
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8 px-4 h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn || !currentUser) {
    return navigate("/auth");
  }

  return (
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white">
              {unreadCount > 99 ? "99+" : unreadCount} unread
            </Badge>
          )}
          {isLoadingUnread && (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          )}
          {unreadError && (
            <Badge
              variant="destructive"
              className="bg-red-600 text-white text-xs"
            >
              Unread count failed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={toggleSearchMode}
            className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
          >
            {isSearchMode ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Close Search
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Messages
              </>
            )}
          </Button>

          {(conversationsError || unreadError) && (
            <Button
              variant="outline"
              onClick={handleRetryAll}
              className="border-red-600 text-red-200 hover:bg-red-700 hover:text-white bg-red-800/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {conversationsError && !isLoadingConversations && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Failed to load conversations</p>
              <p className="text-sm text-red-300">
                {conversationsError?.response?.data?.message ||
                  conversationsError?.message ||
                  "Please check your connection and try again."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchConversations()}
              className="border-red-400 text-red-200 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Card className="h-full flex bg-slate-800/50 border-slate-700 text-white overflow-hidden">
        {/* Search Mode */}
        {isSearchMode ? (
          <div className="flex-1">
            <MessageSearch
              currentUser={currentUser}
              onSelectConversation={handleSelectConversation}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        ) : (
          <>
            {/* Conversation List */}
            <ConversationList
              conversations={displayConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentUser={currentUser}
              isLoading={isLoadingConversations}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  key={selectedConversation?.partner?._id || selectedConversation?.userId || selectedConversation?._id}
                  conversation={selectedConversation}
                  currentUser={currentUser}
                  onNewMessage={onNewConversationMessage}
                  orderContext={orderContext}
                  gigContext={gigContext}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
                  <div className="bg-slate-700 rounded-full p-6 mb-6">
                    <MessageSquare className="w-12 h-12 text-slate-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Welcome to Messages
                  </h2>
                  <p className="text-slate-300 mb-4 max-w-md">
                    Select a conversation from the list to start chatting, or
                    search for specific messages.
                  </p>

                  {/* Unread messages indicator */}
                  {unreadCount > 0 && (
                    <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-4">
                      <p className="text-blue-200 font-medium">
                        You have {unreadCount} unread message
                        {unreadCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-blue-300 text-sm">
                        Check your conversations to see what's new!
                      </p>
                    </div>
                  )}

                  {/* Empty state for no conversations */}
                  {conversations.length === 0 &&
                    !isLoadingConversations &&
                    !conversationsError && (
                      <div className="text-sm text-slate-500 space-y-2">
                        <p>No conversations yet</p>
                        <p>Start by messaging someone from their profile</p>
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                          <h4 className="text-slate-300 font-medium mb-2">
                            Getting Started:
                          </h4>
                          <ul className="text-left space-y-1 text-xs">
                            <li>• Browse freelancer profiles</li>
                            <li>• Click "Message" on someone's profile</li>
                            <li>• Your conversations will appear here</li>
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Loading state for initial load */}
                  {isLoadingConversations && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading your conversations...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
