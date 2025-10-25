import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

const TransactionHistory = ({
  transactions = [],
  pagination = {},
  isLoading = false,
  onPageChange,
  onFilterChange,
  userRole = "freelancer",
  showExport = true,
  title = null,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    dateFrom: "",
    dateTo: "",
  });
  console.log("transactionData", transactions);
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getOrderDisplayTitle = (transaction) => {
    const orderLike = transaction?.order ?? transaction?.order_id;
    if (!orderLike) return "Order";

    if (typeof orderLike === "string") {
      return "Order";
    }

    if (orderLike?.title) {
      return orderLike.title;
    }

    if (orderLike?.order_number) {
      return `Order ${orderLike.order_number}`;
    }

    return "Order";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Completed",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      processing: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Processing",
      },
      failed: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Failed",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Cancelled",
      },
      refunded: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Refunded",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border text-xs`}>{config.label}</Badge>
    );
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      payment: "Payment",
      escrow_hold: "Escrow Hold",
      escrow_release: "Escrow Release",
      refund: "Refund",
      withdrawal: "Withdrawal",
      platform_fee: "Platform Fee",
      chargeback: "Chargeback",
    };
    return typeLabels[type] || type;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title || "Transaction History"}
          </CardTitle>
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="escrow_release">Earnings</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!Array.isArray(transactions) || transactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No transactions found</p>
            <p className="text-slate-500 text-sm">
              Your transaction history will appear here once you start earning
              or making payments.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">
                      {userRole === "freelancer" ? "Client" : "Freelancer"}
                    </TableHead>
                    <TableHead className="text-slate-300">Project</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Fee</TableHead>
                    <TableHead className="text-slate-300">Net</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(transactions) ? transactions : []).map(
                    (transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-slate-700"
                      >
                        <TableCell className="text-slate-300">
                          {transaction.date &&
                          !isNaN(new Date(transaction.date)) ? (
                            <>
                              {format(
                                new Date(transaction.date),
                                "MMM d, yyyy"
                              )}
                              <div className="text-xs text-slate-500">
                                {format(new Date(transaction.date), "HH:mm")}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-500">No date</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {userRole === "freelancer"
                            ? transaction.from_user?.name
                            : transaction.to_user?.name}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="max-w-32 truncate">
                            {getOrderDisplayTitle(transaction)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                            {getTypeLabel(transaction.type)}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-300 font-mono">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-slate-400 font-mono">
                          {formatCurrency(transaction.platform_fee)}
                        </TableCell>
                        <TableCell className="text-green-400 font-mono font-semibold">
                          {formatCurrency(transaction.net_amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {(Array.isArray(transactions) ? transactions : []).map(
                (transaction) => (
                  <Card
                    key={transaction.id}
                    className="bg-slate-700/30 border-slate-600"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white font-medium truncate">
                            {getOrderDisplayTitle(transaction)}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {userRole === "freelancer"
                              ? transaction.from_user?.name
                              : transaction.to_user?.name}
                          </p>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Amount</p>
                          <p className="text-white font-mono">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Net</p>
                          <p className="text-green-400 font-mono">
                            {formatCurrency(transaction.net_amount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-600">
                        <span className="text-slate-400 text-xs">
                          {transaction.date &&
                          !isNaN(new Date(transaction.date))
                            ? format(
                                new Date(transaction.date),
                                "MMM d, yyyy HH:mm"
                              )
                            : "No date"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                <div className="text-slate-400 text-sm">
                  Showing{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-slate-300 text-sm px-2">
                    {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
