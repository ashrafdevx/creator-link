import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useTransactions,
  useAnalytics,
  usePaymentMethods,
  useAddPaymentMethod,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/usePaymentData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  TrendingDown,
  Clock,
  Briefcase,
  AlertTriangle,
  DollarSign,
  Calendar,
  Users,
  Target,
  Plus,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TransactionHistory from "@/components/financial/TransactionHistory";
import EarningsChart from "@/components/financial/EarningsChart";
import PaymentMethodsList from "@/components/financial/PaymentMethodsList";
import { getSpendStats } from "@/components/utils/finance";

export default function Expenses() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [transactionFilters, setTransactionFilters] = useState({});
  const [transactionPage, setTransactionPage] = useState(1);

  // API hooks
  const { data: transactionData, isLoading: transactionsLoading } =
    useTransactions({
      ...transactionFilters,
      page: transactionPage,
      limit: 10,
    });
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const { data: paymentMethods, isLoading: paymentMethodsLoading } =
    usePaymentMethods();

  // Mutations
  const addPaymentMethodMutation = useAddPaymentMethod();
  const removePaymentMethodMutation = useRemovePaymentMethod();
  const setDefaultPaymentMethodMutation = useSetDefaultPaymentMethod();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleAddPaymentMethod = async () => {
    try {
      // In production you'd get payment_method_id from Stripe Elements/SetupIntent
      await addPaymentMethodMutation.mutateAsync({
        payment_method_id: "pm_card_mastercard",
        set_as_default: false,
        nickname: "Secondary Card",
      });

      // Optional: show a toast/notification
      alert("Payment method added successfully");
    } catch (err) {
      alert(err?.message || "Failed to add payment method");
    }
  };
  const handleRemovePaymentMethod = async (paymentMethodId) => {
    try {
      await removePaymentMethodMutation.mutateAsync(paymentMethodId);
    } catch (error) {
      alert("Failed to remove payment method");
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      await setDefaultPaymentMethodMutation.mutateAsync(paymentMethodId);
    } catch (error) {
      alert("Failed to set default payment method");
    }
  };

  // Early returns for loading and access control
  if (authLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || user?.user?.role !== "client") {
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
              This page is only accessible to clients.
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

  const transactions = transactionData?.transactions || [];
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const { thisMonth } = getSpendStats(analytics);
  const completedOrders = analytics?.analytics?.completedOrders || 0;
  const avgProjectCost =
    totalSpent > 0 && completedOrders > 0 ? totalSpent / completedOrders : 0;
  const pendingPayments = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

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
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Client Dashboard
          </Badge>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-400" />
              Expenses Dashboard
            </h1>
            <p className="text-slate-400">
              Monitor your spending, manage payment methods, and track project
              costs.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <span className="text-slate-400 text-sm">This Month</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatCurrency(thisMonth?.value)}
            </div>
            <p className="text-slate-500 text-sm">
              Total spent (GET /api/payment-settings/analytics)
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
              {formatCurrency(pendingPayments)}
            </div>
            <p className="text-slate-500 text-sm">
              Awaiting processing (GET /api/payment-settings/transactions)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="text-slate-400 text-sm">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-slate-500 text-sm">
              All time (GET /api/payment-settings/transactions)
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
              {formatCurrency(avgProjectCost)}
            </div>
            <p className="text-slate-500 text-sm">
              Average cost (GET /api/payment-settings/analytics)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Spending Chart */}
          <EarningsChart
            analytics={analytics}
            isLoading={analyticsLoading}
            userRole="client"
            title="Spending Analytics (GET /api/payment-settings/analytics)"
          />

          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            pagination={transactionData?.pagination}
            isLoading={transactionsLoading}
            onPageChange={setTransactionPage}
            onFilterChange={setTransactionFilters}
            userRole="client"
            title="Payment History (GET /api/payment-settings/transactions)"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <PaymentMethodsList
            paymentMethods={paymentMethods?.payment_methods || []}
            isLoading={paymentMethodsLoading}
            onAdd={handleAddPaymentMethod}
            onRemove={handleRemovePaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
            showAddButton={true}
            title="Payment Methods (GET /api/payment-settings/methods)"
          />

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate("/post-job")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>

              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => navigate("/find-freelancers")}
              >
                <Users className="mr-2 h-4 w-4" />
                Browse Freelancers
              </Button>

              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Download Invoices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
