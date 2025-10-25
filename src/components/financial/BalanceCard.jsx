import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

const BalanceCard = ({
  balance,
  isLoading,
  showWithdrawButton = false,
  onWithdraw,
  title = "Available Balance",
}) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            <div className="h-6 bg-slate-700 rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-16 bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Balance Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {formatCurrency(balance?.available)}
          </div>
          <p className="text-slate-400 text-sm">Ready for withdrawal</p>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300 text-sm">Pending</span>
            </div>
            <div className="text-lg font-semibold text-yellow-400">
              {formatCurrency(balance?.pending)}
            </div>
            <p className="text-xs text-slate-500 mt-1">In escrow</p>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Total Earned</span>
            </div>
            <div className="text-lg font-semibold text-blue-400">
              {formatCurrency(balance?.total_earned)}
            </div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {showWithdrawButton && (
            <Button
              onClick={onWithdraw}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!balance?.available || balance?.available < 10}
            >
              <Download className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          )}

          <Button
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>

        {/* Withdrawal Info */}
        {showWithdrawButton && (
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
            <div className="text-xs text-blue-300">
              <strong>Withdrawal Info:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Minimum withdrawal: $10.00</li>
                <li>Processing time: 1-2 business days</li>
                <li>No platform fees on withdrawals</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
