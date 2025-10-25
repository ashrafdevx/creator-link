import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Loader2
} from 'lucide-react';

const OrderStatusBadge = ({ status, showIcon = true, size = 'default' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          icon: Clock
        };
      case 'active':
        return {
          label: 'Active',
          className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: Loader2
        };
      case 'delivered':
        return {
          label: 'Delivered',
          className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          icon: Package
        };
      case 'revision':
        return {
          label: 'In Revision',
          className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          icon: RefreshCw
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-500/10 text-green-500 border-green-500/20',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          icon: XCircle
        };
      case 'disputed':
        return {
          label: 'Disputed',
          className: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          icon: Clock
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === 'small' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {showIcon && (
        <Icon className={`${iconSize} mr-1 ${status === 'active' ? 'animate-spin' : ''}`} />
      )}
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;