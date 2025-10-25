import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mail,
  MoreHorizontal,
  MessageCircle,
  Search,
  Trash2,
  Loader2,
  CheckCircle,
  Eye,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { adminService } from '@/api/adminService';

const ContactMessages = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch contact messages from API
  const {
    data: messagesResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['adminContactMessages', currentPage, statusFilter, debouncedSearchTerm],
    queryFn: async () => {
      console.log('Fetching contact messages with params:', { currentPage, statusFilter, debouncedSearchTerm });
      const response = await adminService.getAllContactMessages({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? '' : statusFilter,
        search: debouncedSearchTerm
      });
      console.log('Contact messages response:', response);
      return response;
    },
    keepPreviousData: true
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ messageId, status }) => adminService.updateContactMessageStatus(messageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContactMessages']);
      toast.success('Message status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update message status', {
        description: error.message
      });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: ({ messageId, reason }) => adminService.deleteContactMessage(messageId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContactMessages']);
      toast.success('Message deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete message', {
        description: error.message
      });
    }
  });

  const messages = messagesResponse?.data?.messages || [];
  const summary = messagesResponse?.data?.summary || {
    total: 0,
    unread: 0,
    read: 0,
    resolved: 0
  };
  const paginationData = messagesResponse?.data?.pagination || {};
  const pagination = {
    total: paginationData.totalCount || 0,
    pages: paginationData.totalPages || 1,
    page: paginationData.currentPage || 1,
    limit: paginationData.limit || 20
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'read':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (messageId, newStatus) => {
    updateStatusMutation.mutate({ messageId, status: newStatus });
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const handleDelete = (message) => {
    const reason = window.prompt('Enter reason for deleting this message:');
    if (!reason || reason.trim().length === 0) {
      toast.error('Deletion reason is required');
      return;
    }

    if (window.confirm(`Are you sure you want to delete this message?\n\nFrom: ${message.name} (${message.email})\nSubject: ${message.subject}\n\nThis action cannot be undone.`)) {
      deleteMessageMutation.mutate({ messageId: message._id, reason: reason.trim() });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-muted-foreground">Loading messages...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-600">
        <p className="font-semibold">Failed to load contact messages</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Messages
              {summary.unread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {summary.unread} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage and respond to user contact form submissions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {summary.total} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No messages found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow
                    key={message._id}
                    className={message.status === 'unread' ? 'bg-blue-50/50 cursor-pointer hover:bg-blue-100/50' : 'cursor-pointer hover:bg-gray-50'}
                    onClick={() => handleViewMessage(message)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{message.name}</div>
                        <div className="text-sm text-muted-foreground">{message.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[400px]">
                        <div className="font-medium truncate">{message.subject}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {message.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(message.submittedAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(message._id, 'read')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(message._id, 'resolved')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(message)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {messages.length} of {pagination.total} messages
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-red-600">{summary.unread} unread</span>
            <span className="text-yellow-600">{summary.read} read</span>
            <span className="text-green-600">{summary.resolved} resolved</span>
          </div>
        </div>

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-2 mt-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Message Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Message Details
            </DialogTitle>
            <DialogDescription>
              Full contact message information
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 pt-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">From:</span>
                  <span>{selectedMessage.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span className="text-blue-600">{selectedMessage.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Submitted:</span>
                  <span>{formatDate(selectedMessage.submittedAt)}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex gap-2">
                <Badge variant="outline" className={getStatusColor(selectedMessage.status)}>
                  {selectedMessage.status}
                </Badge>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-700">Subject</div>
                <div className="text-base font-semibold">{selectedMessage.subject}</div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-700">Message</div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleStatusChange(selectedMessage._id, 'read');
                  }}
                  disabled={updateStatusMutation.isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleStatusChange(selectedMessage._id, 'resolved');
                  }}
                  disabled={updateStatusMutation.isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                  onClick={() => {
                    handleDelete(selectedMessage);
                    setIsModalOpen(false);
                  }}
                  disabled={deleteMessageMutation.isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContactMessages;