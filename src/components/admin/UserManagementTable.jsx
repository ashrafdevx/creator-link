import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  UserCheck,
  UserX,
  Eye,
  MoreHorizontal,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminService } from '@/api/adminService';
import UserDetailsModal from './UserDetailsModal';

const UserManagementTable = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch users from API
  const {
    data: usersResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['adminUsers', currentPage, debouncedSearchTerm, roleFilter, statusFilter],
    queryFn: () => adminService.getAllUsers({
      page: currentPage,
      limit: 10,
      search: debouncedSearchTerm,
      role: roleFilter === 'all' ? '' : roleFilter,
      status: statusFilter === 'all' ? '' : statusFilter
    }),
    keepPreviousData: true
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user status', {
        description: error.message
      });
    }
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason, duration }) => adminService.suspendUser(userId, { reason, duration }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error('Failed to suspend user', {
        description: error.message
      });
    }
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => adminService.unsuspendUser(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('User unsuspended successfully');
    },
    onError: (error) => {
      toast.error('Failed to unsuspend user', {
        description: error.message
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete user', {
        description: error.message
      });
    }
  });

  const users = usersResponse?.data?.users || [];
  const paginationData = usersResponse?.data?.pagination || {};
  const pagination = {
    total: paginationData.totalCount || 0,
    pages: paginationData.totalPages || 1,
    page: paginationData.currentPage || 1,
    limit: paginationData.limit || 10
  };

  const getStatusBadge = (user) => {
    // Check if user is suspended
    if (user.adminData?.suspendedAt) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    // Check if user is deleted
    if (user.deletedAt) {
      return <Badge variant="secondary">Deleted</Badge>;
    }
    // Check if user is active
    if (user.isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    // Inactive
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getRoleBadge = (role) => {
    const variants = {
      client: 'outline',
      freelancer: 'secondary',
      super_admin: 'destructive',
      staff: 'default'
    };
    return <Badge variant={variants[role] || 'outline'}>{role}</Badge>;
  };

  const handleSuspendUser = (userId) => {
    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) {
      toast.error('Suspension reason is required');
      return;
    }

    const duration = prompt('Suspension duration (7days, 30days, or permanent):', 'permanent');
    if (!['7days', '30days', 'permanent'].includes(duration)) {
      toast.error('Invalid duration. Must be: 7days, 30days, or permanent');
      return;
    }

    suspendUserMutation.mutate({ userId, reason, duration });
  };

  const handleUnsuspendUser = (userId) => {
    const reason = prompt('Please provide a reason for unsuspension (optional):');
    unsuspendUserMutation.mutate({ userId, reason: reason || 'Manual unsuspension by admin' });
  };

  const handleViewDetails = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-600">
        <p className="font-semibold">Failed to load users</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="freelancer">Freelancers</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {users.length} of {pagination.total} users
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <Search className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-muted-foreground">No users found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(user.lastActive)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(user._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.adminData?.suspendedAt ? (
                          <DropdownMenuItem
                            onClick={() => handleUnsuspendUser(user._id)}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Unsuspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleSuspendUser(user._id)}
                            className="text-red-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
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

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-2">
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

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default UserManagementTable;