import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Eye,
  DollarSign,
  Package,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useMyGigs, useGigStats } from "@/hooks/gigs/useGigs";
import { useDeleteGig, useToggleGigStatus } from "@/hooks/gigs/useGigMutations";
import { toast } from "sonner";


export default function MyGigs() {
  const { user } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // API hooks - fetch all gigs and filter on frontend
  const gigsQuery = useMyGigs();
  const statsQuery = useGigStats();
  const deleteGigMutation = useDeleteGig();
  const toggleStatusMutation = useToggleGigStatus();


  const { data: gigsData, isLoading: gigsLoading, error: gigsError } = gigsQuery;
  const { data: statsData, isLoading: statsLoading, error: statsError } = statsQuery;


  // Redirect if not freelancer
  if (!role || role !== "freelancer") {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Package className="h-5 w-5" />
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
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateGig = () => {
    navigate("/gigs/create");
  };

  const handleEditGig = (gigId) => {
    navigate(`/gigs/${gigId}/edit`);
  };

  const handleViewGig = (gigId) => {
    navigate(`/gigs/${gigId}`);
  };

  const handleDeleteGig = async (gigId) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await deleteGigMutation.mutateAsync(gigId);
      } catch (error) {
        toast.error(error.message || 'Failed to delete gig');
      }
    }
  };

  const handleToggleStatus = async (gigId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await toggleStatusMutation.mutateAsync({ gigId, status: newStatus });
      toast.success(`Gig ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to update gig status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Extract data with fallbacks - axios wraps API response in data
  const allGigs = gigsData?.data?.data?.gigs || [];
  const stats = statsData?.data?.data || null;
  const isLoading = gigsLoading || statsLoading;
  const hasError = gigsError || statsError;

  // Filter gigs based on active tab
  const filteredGigs = activeTab === 'all'
    ? allGigs
    : allGigs.filter(gig => gig.status === activeTab);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-400" />
              My Gigs
            </h1>
            <p className="text-slate-400">Manage your services and track performance</p>
          </div>
          <Button
            onClick={handleCreateGig}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Gig
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-slate-400">Loading your gigs...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <Card className="bg-red-900/20 border-red-800 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load data. Please try again.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Overview */}
        {!isLoading && !hasError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Total Gigs
                </CardTitle>
                <Package className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.summary?.totalGigs || 0}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {stats?.stats?.find(s => s._id === "active")?.count || 0} active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.summary?.totalViews || 0}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {stats?.summary?.avgViewsPerGig || 0} avg per gig
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Total Orders
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.summary?.totalOrders || 0}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {stats?.summary?.avgOrdersPerGig || 0} avg per gig
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Avg Price
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${Math.round(stats?.stats?.reduce((acc, s) => acc + (s.avgBasicPrice || 0), 0) / (stats?.stats?.length || 1))}
                </div>
                <p className="text-xs text-slate-400 mt-1">Basic package average</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gigs Management */}
        {!isLoading && !hasError && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gig Management
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                  <TabsTrigger value="all" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300">
                    All ({allGigs.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300">
                    Active ({allGigs.filter(g => g.status === "active").length})
                  </TabsTrigger>
                  <TabsTrigger value="paused" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300">
                    Paused ({allGigs.filter(g => g.status === "paused").length})
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300">
                    Draft ({allGigs.filter(g => g.status === "draft").length})
                  </TabsTrigger>
                </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                  {filteredGigs.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No gigs found
                      </h3>
                      <p className="text-slate-400 mb-4">
                        {activeTab === "all"
                          ? "Create your first gig to start selling your services"
                          : `No ${activeTab} gigs found`
                        }
                      </p>
                      {activeTab === "all" && (
                        <Button
                          onClick={handleCreateGig}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Gig
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredGigs.map((gig) => (
                      <Card key={gig._id} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all">
                        <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Gig Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={gig.image_url || "https://via.placeholder.com/300x200"}
                              alt={gig.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </div>

                          {/* Gig Info */}
                          <div className="flex-grow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3
                                    className="font-semibold text-lg cursor-pointer hover:text-blue-400 line-clamp-2 text-white"
                                    onClick={() => handleViewGig(gig._id)}
                                  >
                                    {gig.title}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge className={getStatusColor(gig.status)}>
                                      {gig.status}
                                    </Badge>
                                    <span className="text-sm text-slate-400">
                                      {gig.category}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewGig(gig._id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Gig
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditGig(gig._id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {gig.status === "active" ? (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(gig._id, gig.status)} disabled={toggleStatusMutation.isLoading}>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Pause
                                    </DropdownMenuItem>
                                  ) : gig.status === "paused" ? (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(gig._id, gig.status)} disabled={toggleStatusMutation.isLoading}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                  ) : gig.status === "draft" ? (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(gig._id, gig.status)} disabled={toggleStatusMutation.isLoading}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGig(gig._id)} disabled={deleteGigMutation.isLoading}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                              {/* Package Pricing */}
                              <div className="flex items-center gap-4 mt-4">
                                <div className="text-sm">
                                  <span className="text-slate-400">From </span>
                                  <span className="font-semibold text-green-400">
                                    ${Math.min(gig.packages?.basic?.price || 0, gig.packages?.standard?.price || 0, gig.packages?.premium?.price || 0)}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-500">•</div>
                                <div className="text-sm text-slate-400">
                                  {gig.packages?.basic?.delivery_time_days || 0}-{gig.packages?.premium?.delivery_time_days || 0} days delivery
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-300">
                                    {gig.stats?.views || 0} views
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-300">
                                    {gig.stats?.orders_completed || 0} orders
                                  </span>
                                </div>
                                <div className="text-sm text-slate-400">
                                  Created {new Date(gig.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
