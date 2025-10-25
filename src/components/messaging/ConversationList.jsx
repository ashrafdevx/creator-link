import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Paperclip,
  MessageSquare,
  Circle,
  Search,
  X,
} from "lucide-react";

export default function ConversationList({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  currentUser,
  isLoading,
  searchQuery = "",
  onSearchChange,
}) {
  // Helper functions
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getMessagePreview = (lastMessage) => {
    if (!lastMessage) return "No messages yet";

    switch (lastMessage.message_type) {
      case "file":
        return "📎 Sent an attachment";
      case "image":
        return "📷 Sent an image";
      case "video":
        return "🎥 Sent a video";
      case "audio":
        return "🎵 Sent an audio";
      case "document":
        return "📄 Sent a document";
      case "text":
      default:
        return lastMessage.message_text || "No messages yet";
    }
  };

  // Process conversations data - handle both API response formats
  const displayConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return [];

    return conversations.map((c) => {
      // Handle different API response structures
      const partnerId = c?.partner?._id || c?.user_id || c?.userId || c?._id;
      const partnerData = c?.partner || c?.user || c;

      const name =
        partnerData?.publicName ||
        partnerData?.name ||
        [partnerData?.firstName, partnerData?.lastName]
          .filter(Boolean)
          .join(" ") ||
        partnerData?.user_name ||
        "Unknown User";

      const avatar = partnerData?.avatar || partnerData?.profileImage || null;

      // Handle last message data
      const lastMessage =
        c?.latest_message || c?.last_message || c?.lastMessage;
      const messageOrder = lastMessage?.order_id;
      const resolvedOrder =
        (messageOrder && typeof messageOrder === "object" && messageOrder) ||
        c?.order ||
        null;
      const orderId =
        resolvedOrder?._id ||
        (typeof messageOrder === "string"
          ? messageOrder
          : c?.order_id || null);

      return {
        _id: c?._id || partnerId,
        userId: partnerId,
        name: name,
        avatar: avatar,
        last_message: {
          message_text: lastMessage?.message_text || lastMessage?.content || "",
          sent_at:
            lastMessage?.sent_at ||
            lastMessage?.timestamp ||
            lastMessage?.createdAt,
          message_type: lastMessage?.message_type || "text",
          sender_id: lastMessage?.sender_id || lastMessage?.senderId,
          attachments: lastMessage?.attachments || [],
        },
        unread_count: c?.unread_count || c?.unreadCount || 0,
        order: resolvedOrder
          ? {
              _id: resolvedOrder._id,
              order_number: resolvedOrder.order_number,
              title: resolvedOrder.title,
              status: resolvedOrder.status,
              order_type: resolvedOrder.order_type,
            }
          : null,
        has_order: Boolean(resolvedOrder || orderId),
        order_id: orderId,
        is_online: Boolean(partnerData?.is_online || partnerData?.online),
        last_message_time:
          lastMessage?.sent_at ||
          lastMessage?.timestamp ||
          lastMessage?.createdAt,
      };
    });
  }, [conversations]);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return displayConversations;

    const query = searchQuery.toLowerCase();
    return displayConversations.filter((convo) => {
      return (
        convo.name?.toLowerCase().includes(query) ||
        convo.last_message?.message_text?.toLowerCase().includes(query)
      );
    });
  }, [displayConversations, searchQuery]);

  // Sort conversations by last message time
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const timeA = new Date(a.last_message_time || 0).getTime();
      const timeB = new Date(b.last_message_time || 0).getTime();
      return timeB - timeA; // Most recent first
    });
  }, [filteredConversations]);

  if (isLoading) {
    return (
      <div className="w-1/3 border-r border-slate-700 bg-slate-800/30">
        <div className="p-4 border-b border-slate-700">
          <Skeleton className="h-8 w-32 bg-slate-700 mb-3" />
          <Skeleton className="h-9 w-full bg-slate-700" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full bg-slate-700" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
                <Skeleton className="h-3 w-1/2 bg-slate-700" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/3 border-r border-slate-700 overflow-hidden flex flex-col bg-slate-800/30">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <Badge
            variant="secondary"
            className="bg-slate-700 text-slate-300 border-slate-600"
          >
            {sortedConversations.length}
          </Badge>
        </div>

        {/* Search Input */}
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 text-sm bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-2 text-xs text-slate-400">
            {sortedConversations.length} of {displayConversations.length}{" "}
            conversations
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <div className="bg-slate-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery ? "No matches found" : "No conversations yet"}
            </h3>
            <p className="text-sm">
              {searchQuery
                ? "Try a different search term"
                : "Start a conversation by messaging someone"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedConversations.map((convo) => {
              const isSelected = selectedConversation?.userId === convo.userId;
              const hasUnread = convo.unread_count > 0;

              return (
                <div
                  key={convo._id}
                  onClick={() => onSelectConversation(convo)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 ${
                    isSelected
                      ? "bg-slate-700/70 border-l-blue-500"
                      : hasUnread
                      ? "bg-slate-800/50 border-l-transparent hover:bg-slate-700/30 hover:border-l-slate-600"
                      : "bg-transparent border-l-transparent hover:bg-slate-800/30 hover:border-l-slate-600"
                  }`}
                >
                  {/* Avatar with Online Status */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={convo.avatar} />
                      <AvatarFallback className="bg-slate-700 text-white font-medium">
                        {getInitials(convo.name)}
                      </AvatarFallback>
                    </Avatar>
                    {convo.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full">
                        <Circle className="w-2 h-2 fill-current text-green-500 m-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Time Row */}
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3
                          className={`font-semibold truncate ${
                            hasUnread ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {convo.name}
                        </h3>
                        {convo.has_order && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-[11px] px-1.5 py-0.5 flex-shrink-0 uppercase tracking-wide"
                          >
                            <FileText className="w-2.5 h-2.5 mr-1" />
                            {convo.order?.order_number ||
                              convo.order?.title ||
                              "Order"}
                            {convo.order?.status
                              ? ` · ${convo.order.status}`
                              : ""}
                          </Badge>
                        )}
                      </div>

                      {/* Time and Unread Badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasUnread && (
                          <Badge className="bg-blue-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center px-1.5">
                            {convo.unread_count > 99
                              ? "99+"
                              : convo.unread_count}
                          </Badge>
                        )}
                        {convo.last_message?.sent_at && (
                          <p className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDistanceToNow(
                              new Date(convo.last_message.sent_at),
                              {
                                addSuffix: true,
                              }
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className="flex items-center gap-1">
                      {convo.last_message?.message_type === "file" && (
                        <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      )}
                      <p
                        className={`text-sm truncate ${
                          hasUnread
                            ? "text-slate-300 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {getMessagePreview(convo.last_message)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/50">
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            {displayConversations.length} conversation
            {displayConversations.length !== 1 ? "s" : ""}
          </span>
          <span>
            {displayConversations.reduce((sum, c) => sum + c.unread_count, 0)}{" "}
            unread
          </span>
        </div>
      </div>
    </div>
  );
}
// import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
// import { formatDistanceToNow } from "date-fns";
// import { FileText, Paperclip, MessageSquare, Circle } from "lucide-react";

// export default function ConversationList({
//   conversations, // ✅ API DATA - Now comes from useGetConversations hook
//   selectedConversation,
//   onSelectConversation,
//   currentUser,
//   isLoading, // ✅ API LOADING STATE - From useGetConversations hook
//   searchQuery = "",
//   onSearchChange,
// }) {
//   const getInitials = (name) =>
//     name
//       ?.split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase() || "U";

//   // ✅ REMOVED MOCK DATA - Now using real API data from props
//   // Mock conversation data is no longer needed as we get real data from useGetConversations

//   const getMessagePreview = (lastMessage) => {
//     if (!lastMessage) return "No messages yet";

//     switch (lastMessage.message_type) {
//       case "file":
//         return "📎 Sent an attachment";
//       case "text":
//       default:
//         return lastMessage.message_text || "No messages yet";
//     }
//   };

//   // ✅ API DATA FILTERING - Using real conversations data
//   const filteredConversations = conversations.filter((convo) => {
//     if (!searchQuery) return true;
//     return convo.name.toLowerCase().includes(searchQuery.toLowerCase());
//   });

//   // ✅ API LOADING STATE - Show skeletons while loading from API
//   if (isLoading) {
//     return (
//       <div className="w-1/3 border-r border-slate-700 p-4 space-y-3">
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="flex items-center gap-3">
//             <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
//             <div className="flex-1 space-y-2">
//               <Skeleton className="h-4 w-3/4 bg-slate-700" />
//               <Skeleton className="h-3 w-1/2 bg-slate-700" />
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="w-1/3 border-r border-slate-700 overflow-y-auto">
//       <div className="p-4 border-b border-slate-700">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-xl font-bold text-white">Messages</h2>
//           <Badge variant="secondary" className="bg-slate-700 text-slate-300">
//             {filteredConversations.length}
//           </Badge>
//         </div>

//         {onSearchChange && (
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search conversations..."
//               value={searchQuery}
//               onChange={(e) => onSearchChange(e.target.value)}
//               className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <MessageSquare className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
//           </div>
//         )}
//       </div>

//       <div className="space-y-1">
//         {/* ✅ API DATA RENDERING - Using real conversations from API */}
//         {filteredConversations.map((convo) => {
//           return (
//             <div
//               key={convo._id}
//               onClick={() => onSelectConversation(convo)}
//               className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
//                 selectedConversation?.userId === convo.userId
//                   ? "bg-slate-700/50"
//                   : "hover:bg-slate-800/30"
//               }`}
//             >
//               <div className="relative">
//                 <Avatar>
//                   <AvatarImage src={convo.avatar} />
//                   <AvatarFallback className="bg-slate-700 text-white">
//                     {getInitials(convo.name)}
//                   </AvatarFallback>
//                 </Avatar>

//                 {/* ✅ API DATA - Online status from API response */}
//                 {convo.is_online && (
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full flex items-center justify-center">
//                     <Circle className="w-2 h-2 fill-current" />
//                   </div>
//                 )}
//               </div>

//               <div className="flex-1 overflow-hidden">
//                 <div className="flex justify-between items-baseline">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-semibold truncate text-white">
//                       {convo.name}
//                     </h3>
//                     {/* ✅ API DATA - order status from API response */}
//                     {convo.has_order && (
//                       <Badge
//                         variant="secondary"
//                         className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-1.5 py-0.5"
//                       >
//                         <FileText className="w-2.5 h-2.5 mr-1" />
//                         order
//                       </Badge>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {/* ✅ API DATA - Unread count from API response */}
//                     {convo.unread_count > 0 && (
//                       <Badge className="bg-blue-600 text-white text-xs min-w-5 h-5 flex items-center justify-center px-1.5">
//                         {convo.unread_count > 99 ? "99+" : convo.unread_count}
//                       </Badge>
//                     )}
//                     {/* ✅ API DATA - Last message time from API response */}
//                     {convo.last_message?.sent_at && (
//                       <p className="text-xs text-slate-400 whitespace-nowrap">
//                         {formatDistanceToNow(
//                           new Date(convo.last_message.sent_at),
//                           { addSuffix: true }
//                         )}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   {/* ✅ API DATA - Message type indicator from API response */}
//                   {convo.last_message?.message_type === "file" && (
//                     <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
//                   )}
//                   <p className="text-sm text-slate-400 truncate">
//                     {/* ✅ API DATA - Last message preview from API response */}
//                     {getMessagePreview(convo.last_message)}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {/* ✅ API DATA - Empty state handling for real API data */}
//         {filteredConversations.length === 0 && !isLoading && (
//           <div className="p-4 text-center text-slate-400">
//             <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-500" />
//             <p>
//               {searchQuery
//                 ? "No conversations match your search"
//                 : "No conversations yet"}
//             </p>
//             {!searchQuery && (
//               <p className="text-xs text-slate-500 mt-1">
//                 Start a conversation by messaging a freelancer
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// ✅ INTEGRATION STATUS:
// ✓ Uses real API data from useGetConversations hook via props
// ✓ Handles API loading state via isLoading prop
// ✓ Displays unread counts from API response
// ✓ Shows online status from API response
// ✓ Renders last message info from API response
// ✓ Handles order status from API response
// → No additional API hooks needed in this component - it receives data via props
