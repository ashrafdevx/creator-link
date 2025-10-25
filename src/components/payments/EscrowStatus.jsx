import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Shield, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EscrowStatus({ payment, onRelease, onDispute, userRole }) {
  const getStatusIcon = () => {
    switch (payment.status) {
      case 'in_escrow':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'released':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (payment.status) {
      case 'in_escrow':
        return 'bg-yellow-100 text-yellow-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusMessage = () => {
    switch (payment.status) {
      case 'in_escrow':
        return 'Payment is held in escrow until job completion';
      case 'released':
        return 'Payment has been released to the specialist';
      case 'disputed':
        return 'Payment is under dispute review';
      default:
        return 'Payment processing';
    }
  };

  const canRelease = userRole === 'creator' && payment.status === 'in_escrow';
  const canDispute = userRole === 'creator' && payment.status === 'in_escrow' && 
                     new Date(payment.dispute_deadline) > new Date();

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {payment.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <div className="font-semibold flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${payment.amount_total.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">
              Specialist gets: ${payment.freelancer_amount.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4">{getStatusMessage()}</p>

        {payment.status === 'in_escrow' && (
          <div className="space-y-3">
            {payment.escrow_release_date && (
              <div className="text-xs text-slate-500">
                Auto-release in: {formatDistanceToNow(new Date(payment.escrow_release_date))}
              </div>
            )}
            
            <div className="flex gap-2">
              {canRelease && (
                <Button 
                  onClick={() => onRelease(payment.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Release Payment
                </Button>
              )}
              
              {canDispute && (
                <Button 
                  onClick={() => onDispute(payment.id)}
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Dispute
                </Button>
              )}
            </div>
          </div>
        )}

        {payment.status === 'released' && payment.released_date && (
          <div className="text-xs text-slate-500">
            Released: {formatDistanceToNow(new Date(payment.released_date), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}