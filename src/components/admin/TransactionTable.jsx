import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import {
  Calendar,
  Download,
  Shield,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { adminService } from '@/api/adminService';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionTable = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch transactions from API
  const {
    data: transactionsResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['adminTransactions', currentPage, statusFilter, typeFilter, dateFrom, dateTo],
    queryFn: () => adminService.getAllTransactions({
      page: currentPage,
      limit: 50,
      status: statusFilter === 'all' ? '' : statusFilter,
      type: typeFilter === 'all' ? '' : typeFilter,
      dateFrom: dateFrom || '',
      dateTo: dateTo || ''
    }),
    keepPreviousData: true
  });

  // Release escrow mutation
  const releaseEscrowMutation = useMutation({
    mutationFn: ({ orderId, reason }) => adminService.releaseEscrow(orderId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminTransactions']);
      toast.success('Escrow funds released successfully');
    },
    onError: (error) => {
      toast.error('Failed to release escrow', {
        description: error.message
      });
    }
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: ({ transactionId, reason }) => adminService.processRefund(transactionId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminTransactions']);
      toast.success('Refund processed successfully');
    },
    onError: (error) => {
      toast.error('Failed to process refund', {
        description: error.message
      });
    }
  });

  const transactions = transactionsResponse?.data?.transactions || [];
  const summary = transactionsResponse?.data?.summary || {
    totalAmount: 0,
    totalPlatformFees: 0,
    transactionCount: 0
  };
  const paginationData = transactionsResponse?.data?.pagination || {};
  const pagination = {
    total: paginationData.totalCount || 0,
    pages: paginationData.totalPages || 1,
    page: paginationData.currentPage || 1,
    limit: paginationData.limit || 50
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'default',
      escrowed: 'secondary',
      refunded: 'destructive',
      pending: 'outline',
      partially_released: 'secondary',
      partially_refunded: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const labels = {
      job_payment: 'Job Payment',
      gig_order: 'Gig Order',
      milestone: 'Milestone',
      refund: 'Refund'
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const handleEscrowRelease = (transaction) => {
    const orderId =
      transaction.order_id?._id ||
      transaction.order_id ||
      transaction.metadata?.order_id;

    if (!orderId) {
      toast.error('No order ID found for this transaction');
      return;
    }

    const reason = window.prompt('Enter reason for escrow release:');
    if (!reason || reason.trim().length === 0) {
      toast.error('Release reason is required');
      return;
    }

    if (window.confirm(`Are you sure you want to release escrow funds for this transaction?\n\nAmount: $${transaction.amount?.toFixed(2) || '0.00'}\nOrder: ${orderId || 'N/A'}\n\nThis action cannot be undone.`)) {
      releaseEscrowMutation.mutate({ orderId, reason: reason.trim() });
    }
  };

  const handleRefund = (transaction) => {
    const reason = window.prompt('Enter reason for refund:');
    if (!reason || reason.trim().length === 0) {
      toast.error('Refund reason is required');
      return;
    }

    if (window.confirm(`Are you sure you want to process a refund for this transaction?\n\nAmount: $${transaction.amount?.toFixed(2) || '0.00'}\n\nThis action cannot be undone.`)) {
      processRefundMutation.mutate({ transactionId: transaction._id, reason: reason.trim() });
    }
  };

  const handleViewDetails = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      toast.info('Exporting transactions to CSV...');
      const blob = await adminService.exportTransactions({
        format: 'csv',
        status: statusFilter === 'all' ? '' : statusFilter,
        type: typeFilter === 'all' ? '' : typeFilter,
        dateFrom: dateFrom || '',
        dateTo: dateTo || ''
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions', {
        description: error.message
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-muted-foreground">Loading transactions...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-600">
        <p className="font-semibold">Failed to load transactions</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Search by order ID or user names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="escrowed">Escrowed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="job_payment">Job Payments</SelectItem>
              <SelectItem value="gig_order">Gig Orders</SelectItem>
              <SelectItem value="milestone">Milestones</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{summary.transactionCount || 0}</div>
          <div className="text-sm text-muted-foreground">Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalAmount || 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Volume</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.totalPlatformFees || 0)}
          </div>
          <div className="text-sm text-muted-foreground">Platform Fees</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Refund</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-muted-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium font-mono text-sm">
                        {transaction.order_id?._id || transaction.order_id || 'N/A'}
                      </div>
                      {getTypeBadge(transaction.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-green-600 font-medium">
                      {formatCurrency(transaction.platform_fee)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Client: </span>
                        <span className="font-medium">
                          {transaction.from_user_id?.firstName || 'Unknown'} {transaction.from_user_id?.lastName || ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Freelancer: </span>
                        <span className="font-medium">
                          {transaction.to_user_id?.firstName || 'Unknown'} {transaction.to_user_id?.lastName || ''}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(transaction.status === 'completed' || transaction.status === 'pending') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefund(transaction)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Issue Refund
                      </Button>
                    )}
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
            Showing {transactions.length} of {pagination.total} transactions (Page {pagination.page} of {pagination.pages})
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

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transactionId={selectedTransactionId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default TransactionTable;
