import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Shield, DollarSign, Lock, Plus, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AddPaymentMethodDialog from './AddPaymentMethodDialog';

const GigPaymentForm = ({ gigData, packageType, onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [requirements, setRequirements] = useState('');
  const queryClient = useQueryClient();

  // Calculate pricing
  const packagePrice = gigData.packages[packageType]?.price || 0;
  const platformFeeRate = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || 10) / 100;
  const platformFee = Math.round(packagePrice * platformFeeRate * 100) / 100;
  const totalAmount = packagePrice + platformFee;

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
      // Step 1: Prepare the order
      const prepareResponse = await api.post(`/api/gigs/${gigData._id}/order`, {
        packageType
      });

      if (!prepareResponse.data.success) {
        throw new Error(prepareResponse.data.message || 'Failed to prepare order');
      }

      const orderData = prepareResponse.data.data;

      // Step 2: Process payment through Stripe
      const paymentResponse = await api.post('/api/payment-settings/process-gig-payment', {
        gig_id: gigData._id,
        package_type: packageType,
        payment_method_id: selectedPaymentMethodId,
        amount: totalAmount,
        package_price: packagePrice,
        platform_fee: platformFee,
        requirements: requirements
      });

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Payment failed');
      }

      // Step 3: Confirm payment and create order
      const confirmResponse = await api.post(`/api/gigs/${gigData._id}/confirm-payment`, {
        packageType,
        requirements,
        transactionId: paymentResponse.data.data.transactionId,
        paymentDetails: {
          packagePrice,
          platformFee,
          totalAmount,
          paymentIntentId: paymentResponse.data.data.paymentIntentId
        }
      });

      if (confirmResponse.data.success) {
        // Use backend message for the toast notification
        toast.success(confirmResponse.data.message || 'Payment confirmed and order created successfully');
        onSuccess(confirmResponse.data.data);
      } else {
        throw new Error(confirmResponse.data.message || 'Order creation failed');
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
    queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    setSelectedPaymentMethodId(newPaymentMethod._id);
  };

  if (isLoadingMethods) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Package Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Package Details</h3>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Package:</span>
              <span className="text-white font-medium capitalize">{packageType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Delivery Time:</span>
              <span className="text-white">{gigData.packages[packageType]?.delivery_time_days} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Revisions:</span>
              <span className="text-white">
                {packageType === 'basic' ? '1' : packageType === 'standard' ? '2' : '3'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Requirements (Optional)</h3>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Any specific requirements for this order..."
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Pricing Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Payment Summary</h3>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Package Price:</span>
              <span className="text-white font-medium">${packagePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Platform Fee ({(platformFeeRate * 100).toFixed(0)}%):</span>
              <span className="text-white">${platformFee.toFixed(2)}</span>
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Total Amount:</span>
              <span className="text-green-400 font-bold text-lg">${totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Payment Method</h3>
        {paymentMethods.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No payment methods found</p>
              <Button
                type="button"
                onClick={handleAddPaymentMethod}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method._id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPaymentMethodId === method._id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method._id}
                  checked={selectedPaymentMethodId === method._id}
                  onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                  className="mr-3 text-green-500 focus:ring-green-500"
                />
                <CreditCard className="w-4 h-4 mr-2 text-slate-400" />
                <div className="flex-1">
                  <span className="text-white">
                    {method.card_details?.brand?.toUpperCase() || 'CARD'} •••• {method.card_details?.last4 || '****'}
                    {method.is_default && (
                      <span className="ml-2 text-xs text-green-400">(Default)</span>
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
              Pay ${totalAmount.toFixed(2)} & Order
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

export default function GigPaymentDialog({
  isOpen,
  onClose,
  gigData,
  packageType,
  onPaymentSuccess
}) {
  const handleSuccess = (orderData) => {
    onPaymentSuccess(orderData);
    onClose();
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  if (!gigData || !packageType) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Package className="w-5 h-5 text-green-400" />
            Order Gig - Payment Required
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete payment to create your order. Funds are held securely in escrow until work is delivered.
          </DialogDescription>
        </DialogHeader>

        <GigPaymentForm
          gigData={gigData}
          packageType={packageType}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </DialogContent>
    </Dialog>
  );
}