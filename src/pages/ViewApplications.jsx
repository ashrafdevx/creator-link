import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Star,
  XCircle,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";
import ApplicationCard from "@/components/jobs/ApplicationCard";
import { motion } from "framer-motion";
import {
  ShortlistMutation,
  useJobApplications,
  useJobCompletion,
  useJobReject,
} from "@/hooks/jobs/useJobSearch";
import { toast } from "sonner";

export default function ViewApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, error, refetch: refetchApplications } = useJobApplications(jobId, {
    page: 1,
    limit: 10,
  });
  //Application Accept Data
  // Call the useJobCompletion mutation hook
  const {
    mutate: mutateJobCompletion,
    data: acceptJobData,
    erroracceptJobError,
    isLoading: acceptJobLoading,
  } = useJobCompletion();

  // Job Reject Data
  const { mutate: mutateJobRejectionMutation, isLoading: rejectionLoading } =
    useJobReject();

  // Job  shortlist Data
  const { mutate: shortListMutation } = ShortlistMutation();

  const jobData = data?.data?.job || {
    id: jobId,
    title: '',
    budget: 0,
  };

  const handleAccept = async () => {
    try {
      await refetchApplications();
    } catch (err) {
      console.error("Failed to refresh applications after order creation:", err);
    }
  };

  const handleReject = (jobId) => {
    const reason = "Project requirements have changed"; // Example reason
    mutateJobRejectionMutation({ jobId, reason }); // Trigger the cancel job mutation
    toast.success("Application rejected");
  };

  const handleShortlist = (jobId, applicationId) => {
    shortListMutation({ jobId, applicationId });
    toast.success("Application shortlisted successfully");
    // TODO: Implement API call to shortlist application
  };

  const handleViewProfile = (userId) => {
    console.log("View profile:", userId);
    // TODO: Navigate to user profile page
  };

  const handleBackToJobs = () => {
    navigate(-1); // Go back to previous page
  };

  // Filter applications based on status
  const filteredApplications =
    statusFilter && statusFilter !== "all"
      ? data?.data?.applications?.filter((app) => app.status === statusFilter)
      : data?.data?.applications;
  // Get status counts
  const statusCounts = {
    total: filteredApplications?.length,
    pending: filteredApplications?.filter((app) => app.status === "pending")
      ?.length,
    under_review: filteredApplications?.filter(
      (app) => app.status === "under_review"
    )?.length,
    shortlisted: filteredApplications?.filter(
      (app) => app.status === "shortlisted"
    )?.length,
    accepted: filteredApplications?.filter((app) => app.status === "accepted")
      ?.length,
    rejected: filteredApplications?.filter((app) => app.status === "rejected")
      ?.length,
  };

  console.log("filteredApplications", filteredApplications);
  if (acceptJobLoading || isLoading) {
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
  }
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToJobs}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              Job Applications
            </h1>
            <p className="text-slate-400">
              {jobData.title} •{" "}
              <span className="text-blue-400">${jobData.budget}</span>
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            <Users className="mr-1 h-3 w-3" />
            Total: {statusCounts.total}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending: {statusCounts.pending}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <FileText className="mr-1 h-3 w-3" />
            Under Review: {statusCounts.under_review}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            <Star className="mr-1 h-3 w-3" />
            Shortlisted: {statusCounts.shortlisted}
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Accepted: {statusCounts.accepted}
          </Badge>
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected: {statusCounts.rejected}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Applications" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Search className="h-4 w-4" />
          <span className="text-sm">
            Showing {filteredApplications?.length} of {statusCounts?.total}{" "}
            applications
          </span>
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications?.length === 0 ? (
        <Card className="bg-slate-800/70 border-slate-700 rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="text-slate-500 mb-4">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {statusFilter && statusFilter !== "all"
                  ? `No ${statusFilter.replace("_", " ")} applications found`
                  : "No applications yet"}
              </h3>
              <p className="text-sm">
                {statusFilter && statusFilter !== "all"
                  ? "Try adjusting your filter or check other application statuses."
                  : "Applications will appear here once freelancers start applying to your job."}
              </p>
            </div>
            {statusFilter && statusFilter !== "all" && (
              <Button
                variant="outline"
                onClick={() => setStatusFilter("all")}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Clear Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredApplications?.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onAccept={handleAccept}
              onReject={handleReject}
              onShortlist={handleShortlist}
              onViewProfile={handleViewProfile}
              jobId={jobId}
              jobData={jobData}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
