import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  DollarSign,
  Briefcase,
  Package,
  TrendingUp,
  AlertTriangle,
  RefreshCcw,
  BarChart3,
  MessageCircle,
  CreditCard,
  Mail,
  LineChart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/api/adminService';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import UserManagementTable from '@/components/admin/UserManagementTable';
import TransactionTable from '@/components/admin/TransactionTable';
import SupportIntegration from '@/components/admin/SupportIntegration';
import ContactMessages from '@/components/admin/ContactMessages';
import AnalyticsReports from '@/components/admin/AnalyticsReports';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth(); // user.role contains the role (e.g., 'super-admin')


  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboardStats,
    enabled: !!user && user?.role === 'super-admin',
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 30000,
    keepPreviousData: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      toast.error('Failed to load dashboard data', {
        description: error.message || 'Please try again later'
      });
    }
  });

  const stats = useMemo(() => dashboardResponse?.data?.overview || null, [dashboardResponse?.data?.overview]);
  const usersByRole = useMemo(() => dashboardResponse?.data?.breakdowns?.usersByRole || {}, [dashboardResponse?.data?.breakdowns?.usersByRole]);


  const handleRefreshStats = async () => {
    try {
      await refetchDashboard();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard', {
        description: error.message || 'Please try again'
      });
    }
  };

  if (isLoading || isDashboardLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription className="text-red-600">
              {dashboardError.message || 'Failed to load dashboard data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefreshStats} variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user?.role !== 'super-admin') {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              You need super-admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-600 mb-4">
              Current role: <Badge variant="outline">{user?.role || 'No role'}</Badge>
            </div>
            <p className="text-sm text-red-600">
              This is a protected route that demonstrates RBAC (Role-Based Access Control) working correctly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName}! Platform overview and management console.
            </p>
          </div>

          <Button
            onClick={handleRefreshStats}
            disabled={isDashboardLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isDashboardLoading ? 'animate-spin' : ''}`} />
            {isDashboardLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="flex gap-6 min-h-[600px]">
        <div className="w-72 shrink-0">
          <Card className="h-full">
            <CardContent className="p-2">
              <TabsList className="flex flex-col h-full w-full justify-start items-start p-2 bg-transparent">
                <div className="w-full mb-4 p-3 border-b">
                  <h3 className="font-semibold text-lg text-slate-800">Dashboard</h3>
                  <p className="text-sm text-slate-600">Admin Controls</p>
                </div>

                <TabsTrigger
                  value="analytics"
                  className="w-full justify-start text-base font-medium p-4 mb-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 hover:bg-slate-50 transition-all"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>Analytics</div>
                    <div className="text-xs text-muted-foreground font-normal">Platform overview & metrics</div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="users"
                  className="w-full justify-start text-base font-medium p-4 mb-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 hover:bg-slate-50 transition-all"
                >
                  <Users className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>Users</div>
                    <div className="text-xs text-muted-foreground font-normal">Manage user accounts</div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="transactions"
                  className="w-full justify-start text-base font-medium p-4 mb-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 hover:bg-slate-50 transition-all"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>Transactions</div>
                    <div className="text-xs text-muted-foreground font-normal">Financial management</div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="support"
                  className="w-full justify-start text-base font-medium p-4 mb-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 hover:bg-slate-50 transition-all"
                >
                  <MessageCircle className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>Support</div>
                    <div className="text-xs text-muted-foreground font-normal">Help & customer service</div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="messages"
                  className="w-full justify-start text-base font-medium p-4 mb-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 hover:bg-slate-50 transition-all"
                >
                  <Mail className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>Messages</div>
                    <div className="text-xs text-muted-foreground font-normal">Contact form submissions</div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="reports"
                  className="w-full justify-start text-base font-medium p-4 mb-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 hover:bg-slate-50 transition-all"
                >
                  <LineChart className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div>Reports</div>
                    <div className="text-xs text-muted-foreground font-normal">Analytics & financial reports</div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <TabsContent value="analytics" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <AdminMetricCard
                title="Total Users"
                value={stats?.totalUsers?.toLocaleString() || '0'}
                subtitle={`${stats?.newUsersToday || 0} new today`}
                icon={Users}
                trend="up"
                trendValue={`${stats?.newUsersToday || 0}`}
                breakdown={{
                  'Clients': usersByRole?.client || 0,
                  'Freelancers': usersByRole?.freelancer || 0,
                }}
                className="bg-blue-50 border-blue-200"
              />

              <AdminMetricCard
                title="Active Orders"
                value={stats?.activeOrders?.toString() || '0'}
                subtitle="Currently active"
                icon={Briefcase}
                className="bg-green-50 border-green-200"
              />

              <AdminMetricCard
                title="Total Transactions"
                value={stats?.totalTransactions?.toString() || '0'}
                subtitle={`${stats?.transactionsToday || 0} today`}
                icon={Package}
                className="bg-purple-50 border-purple-200"
              />

              <AdminMetricCard
                title="Total Revenue"
                value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                subtitle="Platform earnings"
                icon={DollarSign}
                trend="up"
                trendValue={`$${(stats?.revenueToday || 0).toLocaleString()}`}
                className="bg-green-50 border-green-200"
              />

              <AdminMetricCard
                title="Pending Escrow"
                value={`$${(stats?.pendingEscrow || 0).toLocaleString()}`}
                subtitle="Awaiting processing"
                icon={TrendingUp}
                className="bg-yellow-50 border-yellow-200"
              />
            </div>

            <div className="mt-6">
              <AnalyticsReports />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Search, filter, and manage platform users. Suspend accounts, reset passwords, and view user activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagementTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Management
                </CardTitle>
                <CardDescription>
                  Monitor platform transactions, manage escrows, and process refunds. Track revenue and pending payouts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-green-700">
                        ${(stats?.totalRevenue || 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-green-600">Total Platform Revenue</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-yellow-700">
                        ${(stats?.pendingEscrow || 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-yellow-600">Pending Escrow</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-blue-700">
                        ${((stats?.totalRevenue || 0) * 0.1).toLocaleString()}
                      </div>
                      <p className="text-sm text-blue-600">Platform Fees (10%)</p>
                    </CardContent>
                  </Card>
                </div>

                <TransactionTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-0">
            <SupportIntegration />
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <ContactMessages />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <AnalyticsReports />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
