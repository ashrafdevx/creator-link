
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Payment() {
  const [offer, setOffer] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOffer = async () => {
      const params = new URLSearchParams(location.search);
      const offerId = params.get('offerId');
      
      if (!offerId) {
        navigate(createPageUrl('Messages'));
        return;
      }

      try {
        const [currentUser, offerData] = await Promise.all([
          User.me(),
          CustomOffer.get(offerId)
        ]);

        setUser(currentUser);
        setOffer(offerData);
      } catch (err) {
        setError('Failed to load offer details');
      } finally {
        setIsLoading(false);
      }
    };

    loadOffer();
  }, [location, navigate]);

  const handlePayment = async () => {
    if (!offer || !user) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await createPaymentIntent({
        offerId: offer.id,
        amount: offer.price
      });

      if (response.data.success) {
        // --- Defensive checks to prevent invalid data ---
        if (!user.id || typeof user.id !== 'string') {
          throw new Error("Your user ID is invalid. Please try logging out and back in.");
        }
        if (!offer.sender_id || typeof offer.sender_id !== 'string') {
          throw new Error("The sender of this offer is invalid. This offer cannot be processed.");
        }

        // Create order
        await Order.create({
          creator_id: user.id,
          freelancer_id: offer.sender_id,
          title: offer.title,
          price: offer.price,
          source_offer_id: offer.id,
          status: 'in_progress'
        });

        // Update offer status
        await CustomOffer.update(offer.id, { status: 'paid' });

        // Redirect to success page or back to messages
        navigate(createPageUrl('Messages'));
      } else {
        setError(response.data.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-white mb-4" />
          <p className="text-slate-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <Card className="bg-slate-800 border-slate-700 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => navigate(createPageUrl('Messages'))} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <p className="text-slate-400 mb-4">Offer not found</p>
            <Button onClick={() => navigate(createPageUrl('Messages'))} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const platformFee = offer.price * 0.1;
  const totalAmount = offer.price + platformFee;

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">Complete Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">{offer.title}</h3>
            <p className="text-slate-300 text-sm mb-3">{offer.description}</p>
            <div className="text-sm text-slate-400">
              Delivery: {offer.delivery_time}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Service Price:</span>
              <span>${offer.price}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Platform Fee (10%):</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-600 pt-3">
              <div className="flex justify-between text-white font-semibold text-lg">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${totalAmount.toFixed(2)}
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => navigate(createPageUrl('Messages'))}
              variant="outline"
              className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Messages
            </Button>
          </div>

          <div className="text-xs text-slate-400 text-center">
            <p>Secure payment processed by Stripe</p>
            <p>Payment will be held in escrow until work is completed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
