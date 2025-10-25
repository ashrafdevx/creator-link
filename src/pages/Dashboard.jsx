import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  PlusCircle,
  Trash2,
  Bookmark,
  FileText,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Package,
  Clock,
  TrendingDown,
  Activity,
  ShoppingBag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useActivityTracker } from "../components/tracking/ActivityTracker";
import PostedJobCard from "../components/jobs/PostedJobCard";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";
import { useMyJobs } from "@/hooks/jobs/useCurrentUserPostedJobs";
import api from "@/lib/axios";
import { useUpdateJobStatus } from "@/hooks/jobs/useJobSearch";
import { toast } from "sonner";
import { useSavedItems } from "@/hooks/saved/useSavedItems";
import SavedItemCard from "@/components/saved/SavedItemCard";
import { useUnsaveItem } from "@/hooks/saved/useSaveItem";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrderStats } from "@/api/orderApi";

export default function Dashboard() {
  const [recentActivity, setRecentActivity] = useState([]);
  const { trackActivity } = useActivityTracker();
  const navigate = useNavigate();
  const { user: currentUser, isLoaded, isSignedIn } = useAuth();
  const role = currentUser?.role ?? currentUser?.user?.role ?? null;
  const isClient = role === "client";
  const isFreelancer = role === "freelancer";
  const firstName =
    currentUser?.firstName ?? currentUser?.user?.firstName ?? "";
  const lastName =
    currentUser?.lastName ?? currentUser?.user?.lastName ?? "";

  // Fetch orders based on user role
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders', role],
    queryFn: () => getOrders({
      role,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }),
    enabled: !!role
  });

  // Fetch order statistics
  const { data: orderStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: getOrderStats,
    enabled: !!currentUser
  });

  // Current User Posted Jobs (for clients)
  const [page, setPage] = useState(1);
  const limit = 10;
  const {
    data,
    isLoading,
    refetch: refetchMyJobs,
  } = useMyJobs(page, limit);

  // Fetch saved items
  const {
    data: savedItemsData,
    isLoading: isLoadingSavedItems,
  } = useSavedItems();

  const unsaveItem = useUnsaveItem();
  const { mutateAsync: updateJobStatus } = useUpdateJobStatus();

  useEffect(() => {
    // Track dashboard view
    if (trackActivity) {
      trackActivity("dashboard_view");
    }
  }, []);

  // Process orders data for dashboard
  const processedOrders = useMemo(() => {
    if (!ordersData?.orders) return {
      active: [],
      delivered: [],
      completed: [],
      total: 0,
      totalValue: 0,
      activeCount: 0,
      deliveredCount: 0,
      completedCount: 0
    };

    const orders = ordersData.orders;
    const activeOrders = orders.filter(o =>
      o.status === 'active' || o.status === 'revision'
    );
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const completedOrders = orders.filter(o => o.status === 'completed');

    const totalValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return {
      active: activeOrders.slice(0, 4),
      delivered: deliveredOrders.slice(0, 4),
      completed: completedOrders.slice(0, 4),
      total: orders.length,
      activeCount: activeOrders.length,
      deliveredCount: deliveredOrders.length,
      completedCount: completedOrders.length,
      totalValue
    };
  }, [ordersData]);

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      if (!isLoaded || !isSignedIn)
        throw new Error("You must be signed in");
      const token = await getValidAccessToken();

      await api.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetchMyJobs();
      toast.success("Job deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete job.");
    }
  };

  const handleDraftJobStatus = async (jobId) => {
    try {
      await updateJobStatus({ jobId, status: "draft" });
      toast.success("Job draft successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update job status."
      );
    }
  };

  const getActivityDescription = (activity) =>
    ({
      login: "Logged in",
      job_post: "Posted a new job",
      job_application: "Applied to a job",
      profile_update: "Updated profile",
      message_sent: "Sent a message",
      message_read: "Read messages",
      job_completed: "Completed a job",
      review_left: "Left a review",
      dashboard_view: "Viewed dashboard",
      job_browse: "Browsed jobs",
      order_created: "New order created",
      order_delivered: "Order delivered",
      order_completed: "Order completed",
    }[activity.activity_type] || "Unknown activity");

  const getOrderStatusColor = (status) => ({
    'active': 'bg-blue-100 text-blue-800 border-blue-200',
    'delivered': 'bg-purple-100 text-purple-800 border-purple-200',
    'revision': 'bg-orange-100 text-orange-800 border-orange-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'disputed': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200');

  if (isLoading || isLoadingOrders)
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header and Quick Actions */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            Welcome back, {firstName} {lastName}
          </h1>
        </div>
        <div className="flex gap-3">
          {isClient && (
            <Link to={createPageUrl("PostJob")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </Link>
          )}
          {isFreelancer && (
            <Link to="/find-jobs">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Active Orders
            </CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {processedOrders.activeCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {processedOrders.deliveredCount} awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Completed Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {processedOrders.completedCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ${processedOrders.totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              {isClient ? 'Jobs Posted' : 'Applications Sent'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isClient ? (data?.data?.jobs?.length || 0) : (orderStats?.totalApplications || 0)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isClient ? `${data?.data?.jobs?.filter(j => j.status === 'active').length || 0} active` : 'Total applications'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              {isClient ? 'Total Spent' : 'Total Earned'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${orderStats?.totalEarnings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="space-y-8">
        {/* Active Orders Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Active Orders
              </div>
              <Link to="/orders?status=active">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedOrders.active.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {processedOrders.active.map((order) => (
                    <div
                      key={order._id}
                      className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm line-clamp-1 mb-1">
                            {order.title}
                          </h4>
                          <p className="text-slate-400 text-xs">
                            #{order.order_number}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getOrderStatusColor(order.status)} border`}>
                          {order.status}
                        </Badge>
                      </div>

                      {/* Order Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-xs">
                            {isClient
                              ? `${order.freelancer_id?.firstName || ""} ${order.freelancer_id?.lastName || ""}`.trim() || "Freelancer"
                              : `${order.client_id?.firstName || ""} ${order.client_id?.lastName || ""}`.trim() || "Client"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">
                            ${order.total_amount || 0}
                          </span>
                        </div>
                      </div>

                      {/* Progress/Timeline */}
                      {order.due_date && (
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-xs">
                            Due {formatDistanceToNow(new Date(order.due_date), { addSuffix: true })}
                          </span>
                        </div>
                      )}

                      {/* Delivery Status */}
                      {order.delivery_status && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-xs capitalize">
                            {order.delivery_status.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    No active orders at the moment
                  </p>
                  {isFreelancer && (
                    <Link to="/find-jobs">
                      <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                        Browse Available Jobs
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivered Orders (Awaiting Review) */}
        {processedOrders.delivered.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Orders Awaiting Review
                </div>
                <Link to="/orders?status=delivered">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                  >
                    Review All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {processedOrders.delivered.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 bg-slate-900/30 rounded-lg border border-orange-700/30 hover:border-orange-600/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm line-clamp-1 mb-1">
                          {order.title}
                        </h4>
                        <p className="text-slate-400 text-xs">
                          Delivered {formatDistanceToNow(new Date(order.delivered_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 border">
                        Review Required
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">
                        {isClient ? 'From' : 'For'}: {isClient
                          ? order.freelancer_id?.firstName
                          : order.client_id?.firstName}
                      </span>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        Review Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Orders Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completed Orders
              </div>
              <Link to="/orders?status=completed">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedOrders.completed.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {processedOrders.completed.map((order) => (
                    <div
                      key={order._id}
                      className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm line-clamp-1 mb-1">
                            {order.title}
                          </h4>
                          <p className="text-slate-400 text-xs">
                            #{order.order_number}
                          </p>
                        </div>
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200 border">
                          Completed
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-xs">
                            {isClient
                              ? order.freelancer_id?.firstName
                              : order.client_id?.firstName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">
                            ${order.total_amount || 0}
                          </span>
                        </div>
                      </div>

                      {order.completed_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-xs">
                            Completed {new Date(order.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    No completed orders yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posted Jobs Management (Client Only) */}
        {isClient && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Your Posted Jobs
                </div>
                <Link to={createPageUrl("PostJob")}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Post Job
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.data?.jobs?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.data.jobs.slice(0, 4).map((job) => (
                      <div key={job?.id}>
                        <PostedJobCard
                          job={{
                            id: job?._id,
                            title: job?.title,
                            description: job?.description,
                            role_needed: job?.role_needed,
                            niches: job?.niches || [],
                            budget: job?.budget,
                            deadline: job?.deadline,
                            status: job?.status,
                            applicant_count: job?.applicant_count,
                            createdAt: job?.createdAt,
                          }}
                          onEdit={(jobId) => navigate(`/PostJob/${jobId}`)}
                          onViewApplications={() => navigate(`/ViewApplications/${job?._id}`)}
                          onToggleStatus={(jobId) => handleDraftJobStatus(jobId)}
                          onDelete={(jobId) => handleDeleteJob(jobId)}
                          onViewDetails={(jobId) => navigate(createPageUrl(`jobdetails/${job?._id}`))}
                        />
                      </div>
                    ))}

                    {data?.data?.jobs?.length > 4 && (
                      <div className="col-span-1 lg:col-span-2">
                        <Link to={createPageUrl("MyJobs")}>
                          <Button
                            variant="outline"
                            className="w-full border-slate-600 hover:bg-white bg-slate-700 hover:text-slate-800 text-white"
                          >
                            View All Jobs ({data.data.jobs.length})
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-500 mb-4">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 mb-2">No jobs posted yet</p>
                      <p className="text-sm text-slate-500">
                        Start by posting your first job to find talented creators
                      </p>
                    </div>
                    <Link to={createPageUrl("PostJob")}>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-4">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats for Freelancers */}
        {isFreelancer && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Activity className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {processedOrders.total}
                  </p>
                  <p className="text-slate-400 text-sm">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {processedOrders.completedCount}
                  </p>
                  <p className="text-slate-400 text-sm">Delivered Successfully</p>
                </div>
                <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                  <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    ${orderStats?.totalEarnings || 0}
                  </p>
                  <p className="text-slate-400 text-sm">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Saved Items */}
      <Card className="mt-8 bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-200">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Items
            </div>
            <Link to="/saved">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                View All
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingSavedItems ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="bg-slate-800/70 border-slate-700 h-80 animate-pulse">
                    <div className="p-5 space-y-4">
                      <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                      <div className="h-20 bg-slate-600 rounded"></div>
                      <div className="h-8 bg-slate-600 rounded w-1/3"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : savedItemsData?.data?.data?.savedItems?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedItemsData.data.data.savedItems.slice(0, 4).map((savedItem) => (
                    <SavedItemCard
                      key={`${savedItem.item_type}-${savedItem.item_id}`}
                      savedItem={savedItem}
                      onViewDetails={(itemId, itemType) => {
                        if (itemType === "job") {
                          navigate(`/JobDetails/${itemId}`);
                        } else if (itemType === "gig") {
                          navigate(`/gigs/${itemId}`);
                        }
                      }}
                      onRemove={(item) => {
                        const { item_type: itemType, item_id: itemId } = item;
                        unsaveItem.mutate({ itemType, itemId });
                      }}
                      showRemoveButton={true}
                    />
                  ))}
                </div>
                {savedItemsData.data.data.savedItems.length > 4 && (
                  <Link to="/saved">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 hover:bg-white bg-slate-700 hover:text-slate-800 text-white mt-4"
                    >
                      View All Saved Items ({savedItemsData.data.data.savedItems.length})
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  No saved items yet
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Save jobs and gigs to view them here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
