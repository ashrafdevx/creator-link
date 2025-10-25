import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useBalance,
  useTransactions,
  useAnalytics,
  useWithdraw,
  usePayoutSettings,
  usePaymentMethods,
  useCreateConnectAccountLink,
  useCreateConnectDashboardLink,
} from "@/hooks/usePaymentData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase,
  AlertTriangle,
  CreditCard,
  Activity,
  Target,
  Calendar,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "@/components/financial/BalanceCard";
import TransactionHistory from "@/components/financial/TransactionHistory";
import { toast } from "sonner";

export default function Earnings() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const [transactionFilters, setTransactionFilters] = useState({});
  const [transactionPage, setTransactionPage] = useState(1);

  // API hooks
  const isFreelancer = role === "freelancer";

  const { data: balance, isLoading: balanceLoading } = useBalance();

  const { data: transactionData, isLoading: transactionsLoading } =
    useTransactions({
      ...transactionFilters,
      page: transactionPage,
      limit: 10,
    });
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: payoutSettings, isLoading: payoutLoading } =
    usePayoutSettings();
  const {
    mutateAsync: createOnboardingLink,
    isPending: isCreatingOnboardingLink,
  } = useCreateConnectAccountLink();
  const {
    mutateAsync: createDashboardLink,
    isPending: isCreatingDashboardLink,
  } = useCreateConnectDashboardLink();

  const statusSummary = isFreelancer ? payoutSettings?.status_summary : null;
  const isActionPending = isCreatingOnboardingLink || isCreatingDashboardLink;
  const actionLabel =
    statusSummary?.action === "dashboard"
      ? "Open Stripe Dashboard"
      : statusSummary?.action === "continue"
      ? "Continue Stripe Setup"
      : "Set Up Payments";
  const requirementsDue =
    payoutSettings?.account_status?.requirements?.currently_due ?? [];
  const hasOutstandingRequirements =
    Array.isArray(requirementsDue) && requirementsDue.length > 0;
  const payoutConfig = payoutSettings?.payout_settings;

  const handlePrimaryPayoutAction = async () => {
    const origin = window.location.origin;
    if (statusSummary?.action === "dashboard") {
      const dashboardLink = await createDashboardLink({
        return_url: `${origin}/earnings`,
      });
      const targetUrl =
        dashboardLink?.dashboard_url ??
        dashboardLink?.url ??
        dashboardLink;
      if (targetUrl) {
        window.location.href = targetUrl;
      }
      return;
    }

    const { url } = await createOnboardingLink({
      refresh_url: `${origin}/settings/payouts`,
      return_url: `${origin}/settings/payouts/success`,
    });
    window.location.href = url;
  };
  const withdrawMutation = useWithdraw();

  const handleWithdraw = async () => {
    if (!balance?.available || balance.available < 10) {
      toast.error("Minimum withdrawal amount is $10.00");
      return;
    }

    const amount = prompt("Enter withdrawal amount (minimum $10.00):");
    if (!amount || isNaN(amount) || parseFloat(amount) < 10) {
      toast.error("Please enter a valid amount (minimum $10.00)");
      return;
    }

    if (parseFloat(amount) > balance.available) {
      toast.error("Insufficient balance for withdrawal");
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amount: parseFloat(amount),
      });
      toast.success("Withdrawal request submitted successfully!");
    } catch (error) {
      toast.error("Failed to process withdrawal. Please try again.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Early returns for loading and access control
  if (authLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Loading user data...</div>;
  }

  if (role !== "freelancer") {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              This page is only accessible to freelancers.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-slate-800 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate quick stats from analytics (source of truth)
  const analyticsData = analytics?.analytics || {};
  const availableBalance = analyticsData.availableBalance || 0;
  const pendingEarnings = analyticsData.pendingEscrow || 0;
  const totalEarnings = analyticsData.totalEarnings || 0;
  const completedOrders = analyticsData.completedOrders || 0;
  const pendingOrders = analyticsData.pendingOrders || 0;
  const avgEarningsPerContract =
    totalEarnings > 0 && completedOrders > 0
      ? totalEarnings / completedOrders
      : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-slate-600 bg-slate-800 text-white hover:text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Freelancer Dashboard
          </Badge>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              Earnings Dashboard
            </h1>
            <p className="text-slate-400">
              Track your income, manage withdrawals, and analyze your freelance
              performance.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-slate-400 text-sm">Available Balance</span>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatCurrency(availableBalance)}
            </div>
            <p className="text-slate-500 text-sm">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {formatCurrency(pendingEarnings)}
            </div>
            <p className="text-slate-500 text-sm">
              In escrow
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-slate-500 text-sm">
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Avg per Project</span>
            </div>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {formatCurrency(avgEarningsPerContract)}
            </div>
            <p className="text-slate-500 text-sm">
              Per order
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Transaction History */}
          <TransactionHistory
            transactions={transactionData?.transactions || []}
            pagination={transactionData?.pagination}
            isLoading={transactionsLoading}
            onPageChange={setTransactionPage}
            onFilterChange={setTransactionFilters}
            userRole="freelancer"
            title="Transaction History"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Balance Card */}
          <BalanceCard
            balance={{
              available: availableBalance,
              pending: pendingEarnings,
              total_earned: totalEarnings
            }}
            isLoading={analyticsLoading}
            showWithdrawButton={true}
            onWithdraw={handleWithdraw}
            title="Available Balance"
          />

          {/* Payout Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payoutLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-700/40 bg-slate-900/30">
                    {statusSummary?.code === "connected" ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-sm text-slate-100">
                      {statusSummary?.label ?? "Stripe setup required"}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm">
                    {statusSummary?.description ??
                      "Connect your Stripe account to receive payments and withdraw earnings."}
                  </p>

                  {payoutConfig && (
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex justify-between">
                        <span>Payout schedule</span>
                        <span className="text-white">
                          {payoutConfig?.payoutSchedule ?? "Manual"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum payout</span>
                        <span className="text-white">
                          ${(payoutConfig?.payoutThreshold ?? 10).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {hasOutstandingRequirements && (
                    <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/10 p-3 text-sm text-yellow-200">
                      <p className="font-semibold">
                        Stripe still needs the following:
                      </p>
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        {requirementsDue.map((item) => (
                          <li key={item}>{item.replace(/_/g, " ")}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {statusSummary?.action && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handlePrimaryPayoutAction}
                      disabled={isActionPending}
                    >
                      {isActionPending && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {actionLabel}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => navigate("/settings/payouts")}
                  >
                    Manage payout settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payoutLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-700/40 bg-slate-900/30">
                    {statusSummary?.code === "connected" ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-sm text-slate-100">
                      {statusSummary?.label ?? "Stripe setup required"}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm">
                    {statusSummary?.description ??
                      "Connect your Stripe account to receive payments and withdraw earnings."}
                  </p>

                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex justify-between">
                      <span>Payout schedule</span>
                      <span className="text-white">
                        {payoutConfig?.payoutSchedule ?? "Manual"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum payout</span>
                      <span className="text-white">
                        ${(payoutConfig?.payoutThreshold ?? 10).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {hasOutstandingRequirements && (
                    <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/10 p-3 text-sm text-yellow-200">
                      <p className="font-semibold">
                        Stripe still needs the following:
                      </p>
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        {requirementsDue.map((item) => (
                          <li key={item}>{item.replace(/_/g, " ")}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {statusSummary?.action && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handlePrimaryPayoutAction}
                      disabled={isActionPending}
                    >
                      {isActionPending && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {actionLabel}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => navigate("/settings/payouts")}
                  >
                    Manage payout settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate("/find-jobs")}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Find New Jobs
              </Button>

              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => navigate("/orders")}
              >
                <Activity className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
