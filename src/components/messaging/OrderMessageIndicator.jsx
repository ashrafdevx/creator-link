import React from "react";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    classes: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    label: "Pending",
  },
  active: {
    icon: Package,
    classes: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    label: "Active",
  },
  delivered: {
    icon: FileText,
    classes: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    label: "Delivered",
  },
  revision: {
    icon: RefreshCcw,
    classes: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    label: "Revision",
  },
  completed: {
    icon: CheckCircle,
    classes: "bg-green-500/20 text-green-300 border-green-500/40",
    label: "Completed",
  },
  cancelled: {
    icon: AlertTriangle,
    classes: "bg-red-500/20 text-red-300 border-red-500/40",
    label: "Cancelled",
  },
  disputed: {
    icon: ShieldAlert,
    classes: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    label: "Disputed",
  },
};

const DEFAULT_STATUS_CONFIG = {
  icon: FileText,
  classes: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  label: "Order",
};

export default function OrderMessageIndicator({
  orderId,
  orderNumber,
  orderTitle,
  orderStatus,
  orderType,
  className,
}) {
  const normalizedStatus = (orderStatus || "").toLowerCase();
  const { icon: StatusIcon, classes, label } =
    STATUS_CONFIG[normalizedStatus] || DEFAULT_STATUS_CONFIG;

  return (
    <div
      className={cn(
        "border border-slate-600 rounded-lg p-3 bg-slate-800/60 max-w-sm text-xs space-y-2",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-blue-500/20 border border-blue-500/30">
          <FileText className="w-3 h-3 text-blue-300" />
        </div>
        <span className="font-semibold text-blue-300 tracking-wide">
          Order Context
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="text-slate-200 font-medium truncate">
          {orderTitle || "Order Discussion"}
        </div>
        {(orderNumber || orderId) && (
          <div className="text-slate-400 flex items-center gap-1">
            <span className="font-medium text-slate-300">
              {orderNumber || `#${orderId?.slice(-6)}`}
            </span>
            {orderType && (
              <Badge
                variant="secondary"
                className="bg-slate-700/60 text-slate-300 border-slate-500/30 uppercase tracking-wide"
              >
                {orderType}
              </Badge>
            )}
          </div>
        )}
        <Badge
          variant="secondary"
          className={cn(
            "flex items-center gap-1 px-2 py-1 font-medium w-fit",
            classes
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {label}
        </Badge>
      </div>
    </div>
  );
}
