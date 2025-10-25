import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MessageSquare,
  X,
  Clock,
  User,
  FileText,
  Paperclip,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSearchMessages } from "@/hooks/useMessage";

export default function MessageSearch({
  currentUser,
  onSelectConversation,
  searchQuery = "",
  onSearchChange,
}) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(localSearchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  // Update parent component when local query changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(localSearchQuery);
    }
  }, [localSearchQuery, onSearchChange]);

  // Search API hook
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSearchMessages(debouncedQuery, 1, 50);

  const searchResults = searchData?.messages || [];
  const totalResults = searchData?.total || 0;
  // Group search results by conversation
  const groupedResults = useMemo(() => {
    const groups = {};

    searchResults.forEach((message) => {
      const otherUserId =
        message.sender_id === currentUser?.user?._id
          ? message.receiver_id
          : message.sender_id;
      if (!groups[otherUserId]) {
        groups[otherUserId] = {
          userId: otherUserId,
          messages: [],
          // Try to get user info from message data
          userName:
            message.sender_id === currentUser?.user?._id
              ? message.receiver_id?.firstName || "Unknown User"
              : message.sender_id?.firstName || "Unknown User",
          userAvatar:
            message.sender_id === currentUser?.user?._id
              ? message.receiver_avatar
              : message.sender_avatar,
        };
      }

      groups[otherUserId].messages.push(message);
    });

    // Sort messages within each group by timestamp
    Object.values(groups).forEach((group) => {
      group.messages.sort(
        (a, b) =>
          new Date(b.sent_at || b.timestamp) -
          new Date(a.sent_at || a.timestamp)
      );
    });

    return Object.values(groups);
  }, [searchResults, currentUser?.user?._id]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark
            key={index}
            className="bg-yellow-400/30 text-yellow-200 px-1 rounded"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const handleSelectMessage = (message) => {
    const otherUserId =
      message.sender_id === currentUser?.user?._id
        ? message.receiver_id
        : message.sender_id;

    const otherUserName =
      message.sender_id === currentUser?.user?._id
        ? message.receiver_name || "Unknown User"
        : message.sender_name || "Unknown User";

    const otherUserAvatar =
      message.sender_id === currentUser?.user?._id
        ? message.receiver_avatar
        : message.sender_avatar;

    // Create conversation object to select
    const conversation = {
      _id: `search-${otherUserId}`,
      userId: otherUserId,
      name: otherUserName,
      avatar: otherUserAvatar,
      last_message: {
        message_text: message.message_text,
        sent_at: message.sent_at || message.timestamp,
        message_type: message.message_type,
        sender_id: message.sender_id,
      },
    };

    onSelectConversation(conversation);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setDebouncedQuery("");
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">Search Messages</h2>
        </div>

        <div className="relative">
          <Input
            type="text"
            placeholder="Search your messages..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {localSearchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearSearch}
              className="absolute right-2 top-1 h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search Stats */}
        {debouncedQuery && (
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
            <span>
              {isSearching
                ? "Searching..."
                : searchError
                ? "Search failed"
                : `${totalResults} result${
                    totalResults !== 1 ? "s" : ""
                  } found`}
            </span>
            {debouncedQuery && <span>for "{debouncedQuery}"</span>}
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {!debouncedQuery ? (
          // Empty state
          <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8 h-full">
            <div className="bg-slate-700 rounded-full p-4 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Search your messages
            </h3>
            <p>Enter keywords to find specific conversations or messages</p>
            <div className="mt-4 text-sm space-y-1">
              <p className="text-slate-500">Try searching for:</p>
              <ul className="space-y-1">
                <li>• Project names or keywords</li>
                <li>• Person's name</li>
                <li>• File names</li>
                <li>• Specific dates or times</li>
              </ul>
            </div>
          </div>
        ) : isSearching ? (
          // Loading state
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 bg-slate-700" />
                    <Skeleton className="h-3 w-16 bg-slate-700" />
                  </div>
                  <Skeleton className="h-4 w-3/4 bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : searchError ? (
          // Error state
          <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8 h-full">
            <div className="bg-red-900/50 rounded-full p-4 mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Search failed
            </h3>
            <p className="mb-4">
              {searchError?.message || "Unable to search messages right now"}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Try again
            </Button>
          </div>
        ) : groupedResults.length === 0 ? (
          // No results
          <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8 h-full">
            <div className="bg-slate-700 rounded-full p-4 mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No messages found
            </h3>
            <p>Try adjusting your search terms or check the spelling</p>
          </div>
        ) : (
          // Search results
          <div className="space-y-1">
            {groupedResults.map((group) => (
              <div
                key={group.userId}
                className="border-b border-slate-800 last:border-b-0"
              >
                {/* User header */}
                <div className="p-3 bg-slate-800/30 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.userAvatar} />
                      <AvatarFallback className="bg-slate-700 text-white text-sm">
                        {getInitials(group.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {group.userName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {group.messages.length} message
                        {group.messages.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-0">
                  {group.messages.slice(0, 5).map((message) => {
                    // Show max 5 messages per user
                    const isOwnMessage =
                      message.sender_id === currentUser?.user?._id;

                    return (
                      <div
                        key={message._id || message.message_id}
                        onClick={() => handleSelectMessage(message)}
                        className="p-4 hover:bg-slate-800/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              isOwnMessage ? "bg-blue-500" : "bg-slate-500"
                            }`}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-sm font-medium ${
                                  isOwnMessage
                                    ? "text-blue-400"
                                    : "text-slate-300"
                                }`}
                              >
                                {isOwnMessage ? "You" : group.userName}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                {message.message_type === "file" && (
                                  <Paperclip className="w-3 h-3" />
                                )}
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(
                                      message.sent_at || message.timestamp
                                    ),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-slate-200 leading-relaxed">
                              {message.message_type === "file" ? (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" />
                                  Sent an attachment
                                  {message.message_text &&
                                    `: ${message.message_text}`}
                                </span>
                              ) : (
                                highlightText(
                                  message.message_text,
                                  debouncedQuery
                                )
                              )}
                            </p>

                            {message.order_id && (
                              <Badge
                                variant="secondary"
                                className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
                              >
                                <FileText className="w-2.5 h-2.5 mr-1" />
                                Order Message
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {group.messages.length > 5 && (
                    <div className="p-3 text-center">
                      <button
                        onClick={() => handleSelectMessage(group.messages[0])}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View conversation to see {group.messages.length - 5}{" "}
                        more results
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Search,
//   Filter,
//   Calendar,
//   FileText,
//   Paperclip,
//   MessageSquare,
//   User,
// } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import FileAttachment from "./FileAttachment";
// import orderMessageIndicator from "./orderMessageIndicator";
// import { useSearchMessages } from "@/hooks/useMessage";

// const MessageSearch = ({
//   currentUser,
//   onSelectConversation,
//   searchQuery,
//   onSearchChange,
// }) => {
//   // const [searchResults, setSearchResults] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     messageType: "all", // all, text, file, order
//     dateRange: "all", // all, today, week, month
//     sender: "all", // all, me, others
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   // ✅ API INTEGRATION - Use real search API
//   const {
//     data: searchData,
//     isLoading: isSearchLoading,
//     error: searchError,
//   } = useSearchMessages(searchQuery, 1, 20);

//   // Extract search results from API response
//   const searchResults = searchData?.messages || [];

//   const getInitials = (name) =>
//     name
//       ?.split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase() || "U";

//   // Mock search results
//   const mockSearchResults = [
//     {
//       _id: "msg1",
//       sender_id: "user-123",
//       receiver_id: currentUser?.id,
//       message_text:
//         "Hi! I saw your job posting about YouTube video editing and I'm really interested in working with you.",
//       message_type: "text",
//       sent_at: new Date(Date.now() - 3600000).toISOString(),
//       is_read: true,
//       conversation_info: {
//         userId: "user-123",
//         name: "Sarah Johnson",
//         avatar: null,
//       },
//       matched_text: "job posting about YouTube video editing",
//     },
//     {
//       _id: "msg2",
//       sender_id: "user-456",
//       receiver_id: currentUser?.id,
//       message_text: "Here are some examples of my previous video editing work.",
//       message_type: "file",
//       sent_at: new Date(Date.now() - 7200000).toISOString(),
//       is_read: false,
//       attachments: [
//         {
//           _id: "att1",
//           original_name: "video-editing-portfolio.mp4",
//           mime_type: "video/mp4",
//           size: 15728640,
//         },
//       ],
//       conversation_info: {
//         userId: "user-456",
//         name: "Mike Chen",
//         avatar: null,
//       },
//       matched_text: "video editing work",
//     },
//     {
//       _id: "msg3",
//       sender_id: currentUser?.id,
//       receiver_id: "user-789",
//       message_text:
//         "The video editing looks great! Can we discuss the order details?",
//       message_type: "text",
//       sent_at: new Date(Date.now() - 86400000).toISOString(),
//       is_read: true,
//       order_id: "order-123",
//       conversation_info: {
//         userId: "user-789",
//         name: "Emma Davis",
//         avatar: null,
//       },
//       matched_text: "video editing looks great",
//     },
//   ];

//   useEffect(() => {
//     const performSearch = async () => {
//       if (!searchQuery || searchQuery.trim().length < 2) {
//         setSearchResults([]);
//         return;
//       }

//       setIsLoading(true);

//       try {
//         // Mock API call - GET /api/messages/search?q=searchQuery&filters=...
//         console.log("Searching messages:", { query: searchQuery, filters });

//         // Simulate API delay
//         await new Promise((resolve) => setTimeout(resolve, 500));

//         // Filter mock results based on search query
//         const filtered = mockSearchResults.filter(
//           (result) =>
//             result.message_text
//               .toLowerCase()
//               .includes(searchQuery.toLowerCase()) ||
//             result.conversation_info.name
//               .toLowerCase()
//               .includes(searchQuery.toLowerCase())
//         );

//         // Apply additional filters
//         let filteredResults = filtered;

//         if (filters.messageType !== "all") {
//           if (filters.messageType === "order") {
//             filteredResults = filteredResults.filter((msg) => msg.order_id);
//           } else {
//             filteredResults = filteredResults.filter(
//               (msg) => msg.message_type === filters.messageType
//             );
//           }
//         }

//         if (filters.sender !== "all") {
//           if (filters.sender === "me") {
//             filteredResults = filteredResults.filter(
//               (msg) => msg.sender_id === currentUser?.id
//             );
//           } else {
//             filteredResults = filteredResults.filter(
//               (msg) => msg.sender_id !== currentUser?.id
//             );
//           }
//         }

//         setSearchResults(filteredResults);
//       } catch (error) {
//         console.error("Search failed:", error);
//         setSearchResults([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Debounce search
//     const timeoutId = setTimeout(performSearch, 300);
//     return () => clearTimeout(timeoutId);
//   }, [searchQuery, filters, currentUser?.id]);

//   const handleResultClick = (result) => {
//     // Navigate to conversation
//     const conversation = {
//       _id: result._id,
//       userId: result.conversation_info.userId,
//       name: result.conversation_info.name,
//       avatar: result.conversation_info.avatar,
//     };
//     onSelectConversation(conversation);
//   };

//   const highlightMatch = (text, matchedText) => {
//     if (!matchedText) return text;

//     const regex = new RegExp(
//       `(${matchedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
//       "gi"
//     );
//     return text.split(regex).map((part, index) =>
//       regex.test(part) ? (
//         <mark
//           key={index}
//           className="bg-yellow-400/30 text-yellow-200 rounded px-0.5"
//         >
//           {part}
//         </mark>
//       ) : (
//         part
//       )
//     );
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Search Header */}
//       <div className="p-4 border-b border-slate-700 space-y-4">
//         <div className="flex items-center gap-2">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
//             <Input
//               value={searchQuery}
//               onChange={(e) => onSearchChange(e.target.value)}
//               placeholder="Search messages, users, or content..."
//               className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
//               autoFocus
//             />
//           </div>
//           <Button
//             variant="outline"
//             onClick={() => setShowFilters(!showFilters)}
//             className="border-slate-600 text-slate-200 hover:bg-slate-700"
//           >
//             <Filter className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Filters */}
//         {showFilters && (
//           <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
//             <select
//               value={filters.messageType}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, messageType: e.target.value }))
//               }
//               className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
//             >
//               <option value="all">All Types</option>
//               <option value="text">Text Messages</option>
//               <option value="file">File Messages</option>
//               <option value="order">Order Messages</option>
//             </select>

//             <select
//               value={filters.sender}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, sender: e.target.value }))
//               }
//               className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
//             >
//               <option value="all">All Senders</option>
//               <option value="me">My Messages</option>
//               <option value="others">Others' Messages</option>
//             </select>

//             <select
//               value={filters.dateRange}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
//               }
//               className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
//             >
//               <option value="all">All Time</option>
//               <option value="today">Today</option>
//               <option value="week">This Week</option>
//               <option value="month">This Month</option>
//             </select>
//           </div>
//         )}
//       </div>

//       {/* Search Results */}
//       <div className="flex-1 overflow-y-auto">
//         {isLoading ? (
//           <div className="p-4 space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="flex gap-3">
//                 <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-4 w-3/4 bg-slate-700" />
//                   <Skeleton className="h-3 w-1/2 bg-slate-700" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : searchQuery.length < 2 ? (
//           <div className="flex-1 flex items-center justify-center text-center text-slate-400 p-8">
//             <div>
//               <Search className="w-16 h-16 mx-auto mb-4 text-slate-500" />
//               <h3 className="text-lg font-medium text-white mb-2">
//                 Search Messages
//               </h3>
//               <p>
//                 Type at least 2 characters to search through your conversations.
//               </p>
//             </div>
//           </div>
//         ) : searchResults.length === 0 ? (
//           <div className="flex-1 flex items-center justify-center text-center text-slate-400 p-8">
//             <div>
//               <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-500" />
//               <h3 className="text-lg font-medium text-white mb-2">
//                 No Results Found
//               </h3>
//               <p>Try adjusting your search terms or filters.</p>
//             </div>
//           </div>
//         ) : (
//           <div className="p-4 space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-medium text-slate-300">
//                 {searchResults.length} result
//                 {searchResults.length !== 1 ? "s" : ""} found
//               </h3>
//             </div>

//             {searchResults.map((result) => (
//               <div
//                 key={result._id}
//                 onClick={() => handleResultClick(result)}
//                 className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
//               >
//                 <div className="flex gap-3">
//                   <Avatar className="h-10 w-10 flex-shrink-0">
//                     <AvatarImage src={result.conversation_info.avatar} />
//                     <AvatarFallback className="bg-slate-700 text-white">
//                       {getInitials(result.conversation_info.name)}
//                     </AvatarFallback>
//                   </Avatar>

//                   <div className="flex-1 min-w-0 space-y-2">
//                     {/* Header */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium text-white">
//                           {result.conversation_info.name}
//                         </span>
//                         {result.sender_id === currentUser?.id && (
//                           <Badge
//                             variant="secondary"
//                             className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
//                           >
//                             <User className="w-2.5 h-2.5 mr-1" />
//                             You
//                           </Badge>
//                         )}
//                       </div>

//                       <div className="flex items-center gap-2">
//                         {result.message_type === "file" && (
//                           <Paperclip className="w-3 h-3 text-slate-400" />
//                         )}
//                         {result.order_id && (
//                           <FileText className="w-3 h-3 text-blue-400" />
//                         )}
//                         <span className="text-xs text-slate-400">
//                           {formatDistanceToNow(new Date(result.sent_at), {
//                             addSuffix: true,
//                           })}
//                         </span>
//                       </div>
//                     </div>

//                     {/* order Indicator */}
//                     {result.order_id && (
//                       <orderMessageIndicator
//                         orderId={result.order_id}
//                         orderTitle="Project order"
//                         orderStatus="active"
//                         className="max-w-xs"
//                       />
//                     )}

//                     {/* Message Content */}
//                     {result.message_text && (
//                       <p className="text-sm text-slate-300 leading-relaxed">
//                         {highlightMatch(
//                           result.message_text,
//                           result.matched_text
//                         )}
//                       </p>
//                     )}

//                     {/* File Attachments */}
//                     {result.attachments && result.attachments.length > 0 && (
//                       <div className="space-y-2">
//                         {result.attachments.map((attachment, index) => (
//                           <FileAttachment
//                             key={attachment._id || index}
//                             attachment={attachment}
//                             isOwner={result.sender_id === currentUser?.id}
//                             className="max-w-xs"
//                           />
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MessageSearch;
