import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CreditCard, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [setupIntentSecret, setSetupIntentSecret] = useState(null);

  // Create setup intent on component mount
  React.useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const { data } = await api.post('/api/payment-settings/setup-intent', {
          payment_method_types: ['card']
        });
        setSetupIntentSecret(data.data.client_secret);
      } catch (error) {
        console.error('Setup intent error:', error);
        toast.error('Failed to initialize payment setup');
      }
    };
    createSetupIntent();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !setupIntentSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm card setup
      const { setupIntent, error } = await stripe.confirmCardSetup(
        setupIntentSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent.status === 'succeeded') {
        // Save payment method to backend
        const { data } = await api.post('/api/payment-settings/methods', {
          payment_method_id: setupIntent.payment_method,
          set_as_default: setAsDefault,
          nickname: nickname || undefined
        });

        if (data.success) {
          toast.success('Payment method added successfully!');
          onSuccess(data.data.payment_method);
        }
      }
    } catch (error) {
      console.error('Payment method error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add payment method';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!setupIntentSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nickname Input */}
      <div className="space-y-2">
        <Label htmlFor="nickname" className="text-slate-300">
          Nickname (Optional)
        </Label>
        <Input
          id="nickname"
          type="text"
          placeholder="e.g., Personal Card, Work Card"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Card Element */}
      <div className="space-y-2">
        <Label className="text-slate-300">Card Details</Label>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Set as Default Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="default"
          checked={setAsDefault}
          onCheckedChange={setSetAsDefault}
        />
        <Label
          htmlFor="default"
          className="text-sm text-slate-300 cursor-pointer"
        >
          Set as default payment method
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield className="w-3 h-3" />
        <span>Secured by Stripe • Payment information is encrypted</span>
      </div>
    </form>
  );
};

export default function AddPaymentMethodDialog({ isOpen, onClose, onSuccess }) {
  const handleSuccess = (paymentMethod) => {
    onSuccess(paymentMethod);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a new card or bank account to use for payments. Your information is securely stored with Stripe.
          </DialogDescription>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
