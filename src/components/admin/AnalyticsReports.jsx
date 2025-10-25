import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Loader2,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { adminService } from '@/api/adminService';

const AnalyticsReports = () => {
  const [platformTimeRange, setPlatformTimeRange] = useState('30d');
  const [revenueTimeRange, setRevenueTimeRange] = useState('30d');
  const [revenueGroupBy, setRevenueGroupBy] = useState('day');
  const [financialPeriod, setFinancialPeriod] = useState('month');
  const [trendTimeframe, setTrendTimeframe] = useState('12m');
  const [trendGranularity, setTrendGranularity] = useState('month');

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch platform analytics
  const {
    data: platformData,
    isLoading: isPlatformLoading,
    error: platformError
  } = useQuery({
    queryKey: ['platformAnalytics', platformTimeRange],
    queryFn: () => adminService.getPlatformAnalytics({ timeRange: platformTimeRange }),
    onError: (error) => {
      toast.error('Failed to load platform analytics', { description: error.message });
    }
  });

  // Fetch revenue analytics
  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    error: revenueError
  } = useQuery({
    queryKey: ['revenueAnalytics', revenueTimeRange, revenueGroupBy],
    queryFn: () => adminService.getRevenueAnalytics({ timeRange: revenueTimeRange, groupBy: revenueGroupBy }),
    onError: (error) => {
      toast.error('Failed to load revenue analytics', { description: error.message });
    }
  });

  // Fetch financial summary
  const {
    data: financialData,
    isLoading: isFinancialLoading,
    error: financialError
  } = useQuery({
    queryKey: ['financialSummary', financialPeriod, currentYear, currentMonth],
    queryFn: () => adminService.getFinancialSummary({
      period: financialPeriod,
      year: currentYear,
      month: currentMonth
    }),
    onError: (error) => {
      toast.error('Failed to load financial summary', { description: error.message });
    }
  });

  // Fetch revenue trends
  const {
    data: trendsData,
    isLoading: isTrendsLoading,
    error: trendsError
  } = useQuery({
    queryKey: ['revenueTrends', trendTimeframe, trendGranularity],
    queryFn: () => adminService.getRevenueTrends({
      timeframe: trendTimeframe,
      granularity: trendGranularity
    }),
    onError: (error) => {
      toast.error('Failed to load revenue trends', { description: error.message });
    }
  });

  // Fetch commission analysis
  const {
    data: commissionData,
    isLoading: isCommissionLoading,
    error: commissionError
  } = useQuery({
    queryKey: ['commissionAnalysis'],
    queryFn: () => adminService.getCommissionAnalysis({ groupBy: 'month' }),
    onError: (error) => {
      toast.error('Failed to load commission analysis', { description: error.message });
    }
  });

  const platformMetrics = platformData?.data?.metrics || {};
  const revenueMetrics = revenueData?.data || {};
  const financial = financialData?.data || {};
  const trends = trendsData?.data || {};
  const commission = commissionData?.data || {};

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value);
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics & Reports
        </h2>
        <p className="text-gray-600">Platform performance metrics and financial reports</p>
      </div>

      {/* Platform Analytics Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Platform Analytics
              </CardTitle>
              <CardDescription>User growth, jobs, gigs, and revenue overview</CardDescription>
            </div>
            <Select value={platformTimeRange} onValueChange={setPlatformTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isPlatformLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : platformError ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load platform analytics</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Users */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    {platformMetrics.users?.growth !== undefined && (
                      <Badge variant="outline" className={platformMetrics.users.growth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                        {platformMetrics.users.growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {formatPercentage(platformMetrics.users.growth)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{(platformMetrics.users?.total || 0).toLocaleString()}</div>
                  <p className="text-sm text-blue-700">Total Users</p>
                  <div className="mt-2 text-xs text-blue-600">
                    {(platformMetrics.users?.newInPeriod || 0).toLocaleString()} new this period
                  </div>
                  {platformMetrics.users?.breakdown && (
                    <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-700">
                      <div>Clients: {platformMetrics.users.breakdown.clients || 0}</div>
                      <div>Freelancers: {platformMetrics.users.breakdown.freelancers || 0}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Jobs */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    {platformMetrics.jobs?.growth !== undefined && (
                      <Badge variant="outline" className={platformMetrics.jobs.growth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                        {platformMetrics.jobs.growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {formatPercentage(platformMetrics.jobs.growth)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-green-900">{(platformMetrics.jobs?.total || 0).toLocaleString()}</div>
                  <p className="text-sm text-green-700">Total Jobs</p>
                  <div className="mt-2 text-xs text-green-600">
                    {(platformMetrics.jobs?.active || 0).toLocaleString()} active jobs
                  </div>
                </CardContent>
              </Card>

              {/* Gigs */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    {platformMetrics.gigs?.growth !== undefined && (
                      <Badge variant="outline" className={platformMetrics.gigs.growth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                        {platformMetrics.gigs.growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {formatPercentage(platformMetrics.gigs.growth)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{(platformMetrics.gigs?.total || 0).toLocaleString()}</div>
                  <p className="text-sm text-purple-700">Total Gigs</p>
                  <div className="mt-2 text-xs text-purple-600">
                    {(platformMetrics.gigs?.active || 0).toLocaleString()} active gigs
                  </div>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    {platformMetrics.revenue?.growth !== undefined && (
                      <Badge variant="outline" className={platformMetrics.revenue.growth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                        {platformMetrics.revenue.growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {formatPercentage(platformMetrics.revenue.growth)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">{formatCurrency(platformMetrics.revenue?.total || 0)}</div>
                  <p className="text-sm text-emerald-700">Total Revenue</p>
                  <div className="mt-2 text-xs text-emerald-600">
                    {formatCurrency(platformMetrics.revenue?.currentPeriod || 0)} this period
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Analytics Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-emerald-600" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>Detailed revenue breakdown and transaction metrics</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={revenueTimeRange} onValueChange={setRevenueTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={revenueGroupBy} onValueChange={setRevenueGroupBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="month">By Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isRevenueLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : revenueError ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load revenue analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold">{formatCurrency(revenueMetrics.overview?.totalRevenue || 0)}</div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold">{(revenueMetrics.overview?.totalTransactions || 0).toLocaleString()}</div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold">{formatCurrency(revenueMetrics.overview?.averageTransaction || 0)}</div>
                    <p className="text-sm text-gray-600">Avg Transaction</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold">{formatCurrency(revenueMetrics.overview?.totalGrossVolume || 0)}</div>
                    <p className="text-sm text-gray-600">Gross Volume</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Period Stats */}
              {revenueMetrics.currentPeriod && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-emerald-900">Current Period Performance</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Revenue: {formatPercentage(revenueMetrics.currentPeriod.revenueGrowth || 0)}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Transactions: {formatPercentage(revenueMetrics.currentPeriod.transactionGrowth || 0)}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-2xl font-bold text-emerald-900">{formatCurrency(revenueMetrics.currentPeriod.revenue || 0)}</div>
                        <p className="text-sm text-emerald-700">Revenue</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-900">{(revenueMetrics.currentPeriod.transactions || 0).toLocaleString()}</div>
                        <p className="text-sm text-emerald-700">Transactions</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-900">{formatCurrency(revenueMetrics.currentPeriod.grossVolume || 0)}</div>
                        <p className="text-sm text-emerald-700">Gross Volume</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Clients */}
              {revenueMetrics.breakdown?.topClients?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Revenue Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {revenueMetrics.breakdown.topClients.slice(0, 5).map((client, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{client.clientName || 'N/A'}</div>
                            <div className="text-sm text-gray-600">{client.clientEmail || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-700">{formatCurrency(client.platformFees || 0)}</div>
                            <div className="text-sm text-gray-600">{client.transactionCount || 0} transactions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Financial Summary
              </CardTitle>
              <CardDescription>Period-based financial reporting</CardDescription>
            </div>
            <Select value={financialPeriod} onValueChange={setFinancialPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isFinancialLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : financialError ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load financial summary</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-blue-900">{formatCurrency(financial.overview?.totalRevenue || 0)}</div>
                    <p className="text-sm text-blue-700">Total Revenue</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-emerald-900">{formatCurrency(financial.overview?.totalPlatformFees || 0)}</div>
                    <p className="text-sm text-emerald-700">Platform Fees</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-yellow-900">{formatCurrency(financial.overview?.totalStripeFees || 0)}</div>
                    <p className="text-sm text-yellow-700">Stripe Fees</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-green-900">{formatCurrency(financial.overview?.netRevenue || 0)}</div>
                    <p className="text-sm text-green-700">Net Revenue</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-purple-900">{(financial.overview?.transactionCount || 0).toLocaleString()}</div>
                    <p className="text-sm text-purple-700">Transactions</p>
                  </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-indigo-900">{formatCurrency(financial.overview?.averageTransactionValue || 0)}</div>
                    <p className="text-sm text-indigo-700">Avg Transaction</p>
                  </CardContent>
                </Card>
              </div>

              {financial.comparison && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-3">Period Comparison</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Badge variant="outline" className={financial.comparison.growth?.revenueGrowth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          Revenue: {formatPercentage(financial.comparison.growth?.revenueGrowth || 0)}
                        </Badge>
                      </div>
                      <div>
                        <Badge variant="outline" className={financial.comparison.growth?.platformFeeGrowth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          Fees: {formatPercentage(financial.comparison.growth?.platformFeeGrowth || 0)}
                        </Badge>
                      </div>
                      <div>
                        <Badge variant="outline" className={financial.comparison.growth?.transactionGrowth >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          Transactions: {formatPercentage(financial.comparison.growth?.transactionGrowth || 0)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Trends Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Revenue Trends
              </CardTitle>
              <CardDescription>Historical revenue analysis and projections</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={trendTimeframe} onValueChange={setTrendTimeframe}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                  <SelectItem value="24m">24 Months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={trendGranularity} onValueChange={setTrendGranularity}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isTrendsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : trendsError ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load revenue trends</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {trends.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-blue-900">{formatCurrency(trends.summary.totalRevenue || 0)}</div>
                      <p className="text-sm text-blue-700">Total Revenue</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-green-900">{formatCurrency(trends.summary.averageMonthlyRevenue || 0)}</div>
                      <p className="text-sm text-green-700">Avg Monthly Revenue</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-emerald-900">{formatCurrency(trends.summary.peakRevenue || 0)}</div>
                      <p className="text-sm text-emerald-700">Peak Revenue</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-yellow-900">{(trends.summary.totalDataPoints || 0).toLocaleString()}</div>
                      <p className="text-sm text-yellow-700">Data Points</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Trend Data Table */}
              {trends.trendData?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trend Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left p-2">Period</th>
                            <th className="text-right p-2">Revenue</th>
                            <th className="text-right p-2">Fees</th>
                            <th className="text-right p-2">Net Revenue</th>
                            <th className="text-right p-2">Transactions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trends.trendData.map((item, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="p-2">{item.period}</td>
                              <td className="text-right p-2 font-medium">{formatCurrency(item.totalRevenue || 0)}</td>
                              <td className="text-right p-2">{formatCurrency(item.platformFees || 0)}</td>
                              <td className="text-right p-2 text-green-700">{formatCurrency(item.netRevenue || 0)}</td>
                              <td className="text-right p-2">{(item.transactionCount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Commission & Fee Analysis
          </CardTitle>
          <CardDescription>Platform commission breakdown and fee structure analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {isCommissionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : commissionError ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load commission analysis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {commission.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-blue-900">{formatCurrency(commission.summary.totalValue || 0)}</div>
                      <p className="text-sm text-blue-700">Total Value</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-emerald-900">{formatCurrency(commission.summary.totalFees || 0)}</div>
                      <p className="text-sm text-emerald-700">Platform Fees</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-yellow-900">{formatCurrency(commission.summary.totalStripeFees || 0)}</div>
                      <p className="text-sm text-yellow-700">Stripe Fees</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-green-900">{formatCurrency(commission.summary.netRevenue || 0)}</div>
                      <p className="text-sm text-green-700">Net Revenue</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-4">
                      <div className="text-xl font-bold text-purple-900">{(commission.summary.transactionCount || 0).toLocaleString()}</div>
                      <p className="text-sm text-purple-700">Transactions</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Fee Rates */}
              {commission.summary && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-3">Effective Rates</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-emerald-700">
                          {((commission.summary.overallFeeRate || 0) * 100).toFixed(2)}%
                        </div>
                        <p className="text-sm text-gray-600">Overall Fee Rate</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-700">
                          {((commission.summary.effectiveNetRate || 0) * 100).toFixed(2)}%
                        </div>
                        <p className="text-sm text-gray-600">Net Rate</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {((commission.summary.averageStripeFeeRate || 0) * 100).toFixed(2)}%
                        </div>
                        <p className="text-sm text-gray-600">Avg Stripe Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsReports;