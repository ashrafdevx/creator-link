import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Shield, DollarSign, Lock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AddPaymentMethodDialog from './AddPaymentMethodDialog';

const PaymentForm = ({ milestone, jobDetails, orderId, onSuccess, onError, paymentAmount, isJobPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const milestoneAmount = milestone?.amount || 0;
  const platformFeeRate = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || 10) / 100;
  const platformFee = Math.round(milestoneAmount * platformFeeRate * 100) / 100;
  const totalAmount = paymentAmount || (milestoneAmount + platformFee);

  // Fetch user's payment methods
  const { data: paymentMethodsData, isLoading: isLoadingMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await api.get('/api/payment-settings/methods');
      return data.data;
    },
  });

  const paymentMethods = paymentMethodsData?.payment_methods || [];

  // Auto-select default payment method
  useEffect(() => {
    const defaultMethod = paymentMethods.find(pm => pm.is_default);
    if (defaultMethod && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(defaultMethod._id);
    } else if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(paymentMethods[0]._id);
    }
  }, [paymentMethods, selectedPaymentMethodId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedPaymentMethodId) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      // For job payments (pre-order), pass payment method ID directly
      if (isJobPayment) {
        await onSuccess(selectedPaymentMethodId);
        return;
      }

      if (!orderId) {
        throw new Error('Order ID is required to process this payment');
      }

      // Call backend to process milestone payment for an order
      const { data } = await api.post('/api/payment-settings/process-payment', {
        order_id: orderId,
        milestone_id: milestone.id,
        payment_method_id: selectedPaymentMethodId,
      });

      if (data.success) {
        toast.success('Payment processed successfully!');
        onSuccess(data);
      } else if (data.requires_action) {
        // Handle 3D Secure authentication if needed
        toast.info('Additional authentication required');
        onError(new Error('Additional authentication required'));
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Payment processing failed';
      toast.error(errorMessage);
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setIsAddPaymentDialogOpen(true);
  };

  const handlePaymentMethodAdded = (newPaymentMethod) => {
    // Refresh payment methods list
    queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    // Auto-select the newly added payment method
    setSelectedPaymentMethodId(newPaymentMethod._id);
  };

  if (isLoadingMethods) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job & Milestone Details */}
      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
        <div>
          <h4 className="font-semibold text-white mb-1">{jobDetails.title}</h4>
          <p className="text-sm text-slate-400">{milestone?.title}</p>
        </div>

        <Separator className="bg-slate-700" />

        {/* Payment Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Milestone Amount:</span>
            <span className="font-medium">${milestoneAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Platform Fee ({(platformFeeRate * 100).toFixed(0)}%):</span>
            <span className="font-medium">${platformFee.toFixed(2)}</span>
          </div>
          <Separator className="bg-slate-700" />
          <div className="flex justify-between text-white font-bold text-base">
            <span>Total Amount:</span>
            <span className="text-green-400">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Escrow Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
          <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300">
            Funds will be held in escrow until milestone completion. Released automatically after 10 days or upon manual approval.
          </p>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Select Payment Method
        </label>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <CreditCard className="w-12 h-12 mx-auto text-slate-500 mb-3" />
            <p className="text-sm text-slate-400 mb-3">No payment methods available</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPaymentMethod}
              className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method._id}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPaymentMethodId === method._id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method._id}
                  checked={selectedPaymentMethodId === method._id}
                  onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium capitalize">
                      {method.type === 'card' ? method.card_details?.brand : method.type}
                    </span>
                    {method.is_default && (
                      <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-400">
                    •••• {method.type === 'card' ? method.card_details?.last4 : method.bank_details?.last4}
                    {method.type === 'card' && method.card_details?.exp_month && method.card_details?.exp_year && (
                      <> • Exp {method.card_details.exp_month}/{method.card_details.exp_year}</>
                    )}
                    {method.metadata?.nickname && (
                      <> • {method.metadata.nickname}</>
                    )}
                  </span>
                </div>
              </label>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPaymentMethod}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Payment Method
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isProcessing || !selectedPaymentMethodId}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Pay ${totalAmount.toFixed(2)}
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield className="w-3 h-3" />
        <span>Secured by Stripe • Payment information is encrypted</span>
      </div>

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        isOpen={isAddPaymentDialogOpen}
        onClose={() => setIsAddPaymentDialogOpen(false)}
        onSuccess={handlePaymentMethodAdded}
      />
    </form>
  );
};

export default function MilestonePaymentDialog({
  isOpen,
  onClose,
  jobDetails,
  milestone,
  orderId,
  onPaymentSuccess,
  paymentAmount,
  isJobPayment
}) {
  const handleSuccess = (paymentData) => {
    onPaymentSuccess(paymentData);
    if (!isJobPayment) {
      onClose();
    }
  };

  const handleError = (error) => {
    // Error already handled in PaymentForm with toast
    console.error('Payment error:', error);
  };

  if (!milestone) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5 text-green-400" />
            {isJobPayment ? 'Select Freelancer - Payment Required' : 'Milestone Payment'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isJobPayment
              ? 'To select this freelancer, you must pay in advance. Funds are held securely in escrow.'
              : 'To select this freelancer, you must pay the first milestone in advance. Funds are held securely in escrow.'}
          </DialogDescription>
        </DialogHeader>

        <PaymentForm
          milestone={milestone}
          jobDetails={jobDetails}
          orderId={orderId}
          onSuccess={handleSuccess}
          paymentAmount={paymentAmount}
          isJobPayment={isJobPayment}
          onError={handleError}
        />
      </DialogContent>
    </Dialog>
  );
}
