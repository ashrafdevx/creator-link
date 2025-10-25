import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAddOrderMessage } from '@/hooks/useOrderOperations';
import {
  MessageSquare,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Send,
  Paperclip,
  RefreshCw,
  DollarSign,
  Calendar,
  Star
} from 'lucide-react';

const TimelineIcon = ({ eventType }) => {
  const iconClass = "w-4 h-4";

  switch (eventType) {
    case 'order_placed':
      return <DollarSign className={`${iconClass} text-green-400`} />;
    case 'payment_confirmed':
      return <CheckCircle className={`${iconClass} text-green-400`} />;
    case 'work_started':
      return <Clock className={`${iconClass} text-blue-400`} />;
    case 'message_sent':
      return <MessageSquare className={`${iconClass} text-slate-400`} />;
    case 'file_delivered':
      return <Package className={`${iconClass} text-purple-400`} />;
    case 'revision_requested':
      return <RefreshCw className={`${iconClass} text-orange-400`} />;
    case 'revision_delivered':
      return <Package className={`${iconClass} text-purple-400`} />;
    case 'order_completed':
      return <CheckCircle className={`${iconClass} text-green-400`} />;
    case 'order_cancelled':
      return <XCircle className={`${iconClass} text-red-400`} />;
    case 'dispute_opened':
      return <AlertCircle className={`${iconClass} text-red-400`} />;
    case 'deadline_extended':
      return <Calendar className={`${iconClass} text-yellow-400`} />;
    case 'milestone_completed':
      return <Star className={`${iconClass} text-yellow-400`} />;
    case 'client_rating':
    case 'freelancer_rating':
      return <Star className={`${iconClass} text-yellow-400`} />;
    default:
      return <Clock className={`${iconClass} text-slate-400`} />;
  }
};

const TimelineEvent = ({ event, isLast }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'client':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'freelancer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'system':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className={`flex gap-4 ${!isLast ? 'pb-8' : ''}`}>
      {/* Timeline Line and Icon */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <TimelineIcon eventType={event.event_type} />
        </div>
        {!isLast && <div className="w-0.5 bg-slate-700 flex-1 mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Badge variant="outline" className={`${getRoleBadgeColor(event.actor_role)} text-xs mb-2`}>
              {event.actor_role}
            </Badge>
            <p className="text-sm text-white font-medium">{event.message}</p>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Attachments */}
        {event.attachments && event.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {event.attachments.map((attachment, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-white">{attachment.file_name}</p>
                      <p className="text-xs text-slate-400">
                        {(attachment.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => window.open(attachment.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Metadata Display */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-2 p-3 bg-slate-800/30 rounded-lg">
            {event.metadata.revision_number && (
              <p className="text-xs text-slate-400">
                Revision #{event.metadata.revision_number}
              </p>
            )}
            {event.metadata.amount && (
              <p className="text-xs text-slate-400">
                Amount: ${event.metadata.amount}
              </p>
            )}
            {event.metadata.reason && (
              <p className="text-xs text-slate-400 italic">
                Reason: {event.metadata.reason}
              </p>
            )}
            {event.metadata.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < event.metadata.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-yellow-400">
                  {event.metadata.rating}/5
                </span>
              </div>
            )}
            {event.metadata.review && (
              <p className="text-xs text-slate-300 italic mt-2">
                "{event.metadata.review}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderTimeline = ({ order, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const addMessage = useAddOrderMessage();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await addMessage.mutateAsync({
      orderId: order._id,
      message: newMessage.trim()
    });

    setNewMessage('');
    setIsAddingMessage(false);
  };

  const timeline = order.timeline || [];
  const isFreelancer = currentUserId === order.freelancer_id?._id || currentUserId === order.freelancer_id?.id;

  // Modify client rating display for freelancers who haven't rated yet
  const processedTimeline = timeline.map(event => {
    // If it's a client rating and viewer is freelancer who hasn't rated yet
    if (event.event_type === 'client_rating' && isFreelancer && !order.freelancer_rating?.rating) {
      return {
        ...event,
        message: 'Client has submitted their rating',
        metadata: null, // Explicitly hide rating details
        _hideDetails: true // Flag to indicate hidden content
      };
    }
    return event;
  });

  const sortedTimeline = [...processedTimeline].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="space-y-6">
      {/* Add Message Section */}
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            {!isAddingMessage ? (
              <Button
                onClick={() => setIsAddingMessage(true)}
                variant="outline"
                className="w-full justify-start text-slate-400 hover:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add a message to timeline
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[100px] bg-slate-700 border-slate-600 text-white"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsAddingMessage(false);
                      setNewMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || addMessage.isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline Events */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Order Activity</h3>

          {sortedTimeline.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-0">
              {sortedTimeline.map((event, index) => (
                <TimelineEvent
                  key={event._id || index}
                  event={event}
                  isLast={index === sortedTimeline.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTimeline;