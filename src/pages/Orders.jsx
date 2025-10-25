import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrders, useOrderStats } from '@/hooks/useOrderOperations';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { calculateTimeRemaining } from '@/api/orderApi';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  DollarSign,
  Package,
  Filter,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Briefcase,
  User,
  CheckCircle
} from 'lucide-react';

const OrderCard = ({ order, userRole }) => {
  const timeRemaining = calculateTimeRemaining(order.due_date);
  const isClient = userRole === 'client';
  const otherParty = isClient ? order.freelancer_id : order.client_id;

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg">
      <Link to={`/orders/${order._id}`}>
        <CardContent className="p-6">
          {/* Order Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-slate-400">{order.order_number}</span>
                <OrderStatusBadge status={order.status} size="small" />
                {timeRemaining.isOverdue && order.status === 'active' && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                {order.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>
                    {isClient ? 'Freelancer' : 'Client'}: {otherParty?.firstName} {otherParty?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Amount</p>
              <p className="text-sm font-semibold text-white">
                ${isClient ? order.total_amount : order.freelancer_earnings}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Type</p>
              <Badge variant="secondary" className="text-xs">
                {order.order_type === 'job' ? 'Job' : 'Gig'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Due Date</p>
              <p className="text-sm text-white">
                {new Date(order.due_date).toLocaleDateString()}
              </p>
            </div>
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Time Left</p>
                <p className={`text-sm font-medium ${timeRemaining.isOverdue ? 'text-red-400' : 'text-green-400'}`}>
                  {timeRemaining.text}
                </p>
              </div>
            )}
            {order.status === 'completed' && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Completed</p>
                <p className="text-sm font-medium text-green-400">
                  {formatDistanceToNow(new Date(order.completed_at || order.updatedAt), { addSuffix: true })}
                </p>
              </div>
            )}
            {order.status === 'cancelled' && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Cancelled</p>
                <p className="text-sm font-medium text-red-400">
                  {formatDistanceToNow(new Date(order.cancelled_at || order.updatedAt), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {order.milestones?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Milestones</span>
                <span className="text-white">
                  {order.milestones.filter(m => m.status === 'completed').length} / {order.milestones.length} completed
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(order.milestones.filter(m => m.status === 'completed').length / order.milestones.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick Actions Preview */}
          {order.status === 'delivered' && userRole === 'client' && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">
                Action Required: Review Delivery
              </Badge>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const role = user?.role ?? role ?? null;
  const isFreelancer = role === 'freelancer';
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10
  });

  const { data, isLoading, error } = useOrders(filters);
  const { data: stats } = useOrderStats();

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load orders</h3>
        <p className="text-slate-400">{error.message}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
        <p className="text-slate-400">Manage and track all your orders in one place</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Orders</p>
                  <p className="text-2xl font-bold text-white">
                    {isFreelancer
                      ? stats.as_freelancer?.find(s => s._id === 'active')?.count || 0
                      : stats.as_client?.find(s => s._id === 'active')?.count || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {isFreelancer
                      ? stats.as_freelancer?.find(s => s._id === 'completed')?.count || 0
                      : stats.as_client?.find(s => s._id === 'completed')?.count || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {isFreelancer ? 'Total Earned' : 'Total Spent'}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {isFreelancer
                      ? `$${stats.as_freelancer?.reduce((sum, s) => sum + (s.total_earnings || 0), 0).toFixed(0) || 0}`
                      : `$${stats.as_client?.reduce((sum, s) => sum + (s.total_amount || 0), 0).toFixed(0) || 0}`}
                  </p>
                </div>
                {isFreelancer ? (
                  <Briefcase className="w-8 h-8 text-purple-400" />
                ) : (
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="revision">In Revision</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="total_amount">Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
              <SelectTrigger className="w-[120px] bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-slate-400 mb-6">
              {filters.status !== 'all'
                ? `You don't have any ${filters.status} orders.`
                : "You haven't created or received any orders yet."}
            </p>
            {filters.status !== 'all' && (
              <Button
                onClick={() => handleFilterChange('status', 'all')}
                variant="outline"
              >
                View All Orders
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} userRole={role} />
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-400 px-4">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
