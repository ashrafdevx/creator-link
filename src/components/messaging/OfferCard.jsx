
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Loader2 } from 'lucide-react'; // Removed DollarSign from here
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OfferCard({ offer, currentUser, conversationId }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const isSender = offer.sender_id === currentUser.id;
  const isReceiver = offer.receiver_id === currentUser.id;

  const handleAccept = () => {
    setIsLoading(true);
    // Navigate to payment page with offer ID
    navigate(createPageUrl(`Payment?offerId=${offer.id}`));
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await CustomOffer.update(offer.id, { status: 'declined' });
      // The polling will refresh the offer status
    } catch (error) {
      console.error('Failed to decline offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    const statuses = {
      pending: { bg: "bg-yellow-500", text: "Pending" },
      accepted: { bg: "bg-blue-500", text: "Accepted" },
      paid: { bg: "bg-green-500", text: "Paid" },
      declined: { bg: "bg-red-500", text: "Declined" },
      withdrawn: { bg: "bg-slate-500", text: "Withdrawn" }
    };
    const status = statuses[offer.status] || statuses.pending;
    return <Badge className={`${status.bg} text-white text-xs`}>{status.text}</Badge>;
  };

  return (
    <Card className="bg-slate-800 border-slate-600 max-w-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-base font-semibold">{offer.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-slate-300 text-sm mt-1">{offer.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm mb-4">
          <div className="flex items-center gap-1 text-green-400">
            <span className="font-bold">${offer.price}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{offer.delivery_time}</span>
          </div>
        </div>
        
        {isReceiver && offer.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              onClick={handleAccept} 
              disabled={isLoading} 
              className="bg-green-600 hover:bg-green-700 flex-1 text-sm h-8"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1"/> Accept</>}
            </Button>
            <Button 
              onClick={handleDecline} 
              disabled={isLoading} 
              variant="destructive" 
              className="flex-1 text-sm h-8"
            >
              <X className="w-4 h-4 mr-1"/> Decline
            </Button>
          </div>
        )}
        
        {offer.status === 'paid' && (
          <div className="text-center">
            <Badge className="bg-green-500 text-white">
              ✓ Offer accepted and paid. Work can begin!
            </Badge>
          </div>
        )}
        
        {offer.status === 'declined' && (
          <div className="text-center">
            <Badge className="bg-red-500 text-white">
              Offer declined
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
