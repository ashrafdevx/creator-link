import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Trash2, ExternalLink, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { makeAuthenticatedRequest } from '@/utils/authUtils';
import { toast } from 'sonner';

export default function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest('/api/notifications?limit=10');
      return await response.json();
    },
  });

  const notifications = data?.data?.notifications || [];

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await makeAuthenticatedRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      // Optimistically update the unread count
      queryClient.setQueryData(['notifications', 'unread-count'], (oldData) => {
        if (!oldData?.data?.count) return oldData;
        return {
          ...oldData,
          data: { count: Math.max(0, oldData.data.count - 1) }
        };
      });

      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await makeAuthenticatedRequest('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      return await response.json();
    },
    onSuccess: () => {
      // Immediately update the cache
      queryClient.setQueryData(['notifications', 'unread-count'], (oldData) => ({
        ...oldData,
        data: { count: 0 }
      }));

      // Invalidate queries to refetch from server
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      await makeAuthenticatedRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      toast.success('Notification deleted');
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification._id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type = '') => {
    const normalized = type.toLowerCase();
    if (normalized.includes('application')) return '\u{1F4DD}';
    if (normalized.includes('order')) return '\u{1F4E6}';
    if (normalized.includes('payment') || normalized.includes('payout')) return '\u{1F4B5}';
    if (normalized.includes('review')) return '\u{2B50}';
    if (normalized.includes('message')) return '\u{1F4AC}';
    if (normalized.includes('gig')) return '\u{1F3AF}';
    return '\u{1F514}';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-blue-500';
      case 'normal':
        return 'border-l-4 border-l-slate-600';
      case 'low':
        return 'border-l-4 border-l-slate-700';
      default:
        return 'border-l-4 border-l-slate-600';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-slate-700/30' : ''
                } ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${
                        !notification.is_read ? 'text-white' : 'text-slate-300'
                      }`}>
                        {notification.title}
                      </h4>

                      <button
                        onClick={(e) => handleDelete(e, notification._id)}
                        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>

                      {notification.action_url && (
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      )}
                    </div>

                    {!notification.is_read && (
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-700 text-center">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
