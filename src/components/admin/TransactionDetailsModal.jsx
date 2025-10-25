import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  Calendar,
  User,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { adminService } from '@/api/adminService';

const TransactionDetailsModal = ({ transactionId, open, onOpenChange }) => {
  // Fetch transaction details
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['transactionDetails', transactionId],
    queryFn: () => adminService.getTransactionDetails(transactionId),
    enabled: !!transactionId && open
  });

  const transaction = response?.data;

  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      escrowed: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      refunded: { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
      pending: { variant: 'outline', icon: Clock, color: 'text-yellow-600' },
      partially_released: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      partially_refunded: { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Failed to load transaction details: {error.message}</p>
          </div>
        )}

        {transaction && (
          <div className="space-y-6">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transaction Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{transaction._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(transaction.amount)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(transaction.platformFee)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Stripe Fee</p>
                    <p className="text-xl font-semibold text-purple-600">{formatCurrency(transaction.stripeFee)}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Amount</p>
                    <p className="text-xl font-semibold text-indigo-600">{formatCurrency(transaction.netAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties Involved */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Parties Involved
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">From (Client)</p>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">{transaction.fromUser?.firstName} {transaction.fromUser?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.fromUser?.email}</p>
                      <Badge variant="outline" className="mt-2">{transaction.fromUser?.role}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">To (Freelancer)</p>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">{transaction.toUser?.firstName} {transaction.toUser?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.toUser?.email}</p>
                      <Badge variant="outline" className="mt-2">{transaction.toUser?.role}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Information */}
            {transaction.escrowData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Escrow Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Escrow Status</p>
                      <Badge variant="secondary">{transaction.escrowData.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Held Amount</p>
                      <p className="font-semibold">{formatCurrency(transaction.escrowData.heldAmount)}</p>
                    </div>
                    {transaction.escrowData.releasedAmount > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Released Amount</p>
                        <p className="font-semibold text-green-600">{formatCurrency(transaction.escrowData.releasedAmount)}</p>
                      </div>
                    )}
                    {transaction.escrowData.releasedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Released At</p>
                        <p className="text-sm">{formatDate(transaction.escrowData.releasedAt)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stripe Information */}
            {transaction.stripeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stripe Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    {transaction.stripeData.paymentIntentId && (
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Intent ID</p>
                        <p className="font-mono text-xs">{transaction.stripeData.paymentIntentId}</p>
                      </div>
                    )}
                    {transaction.stripeData.chargeId && (
                      <div>
                        <p className="text-sm text-muted-foreground">Charge ID</p>
                        <p className="font-mono text-xs">{transaction.stripeData.chargeId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description & Metadata */}
            {(transaction.description || transaction.metadata) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transaction.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{transaction.description}</p>
                    </div>
                  )}
                  {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                      <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                        {JSON.stringify(transaction.metadata, null, 2)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
