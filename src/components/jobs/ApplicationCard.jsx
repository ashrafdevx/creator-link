import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  DollarSign,
  ExternalLink,
  MoreVertical,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  FileText,
  Link as LinkIcon,
  MessageCircle,
  UserCheck,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
// Contract imports removed - using orders system now
import { Package } from "lucide-react";
import MilestonePaymentDialog from "@/components/payments/MilestonePaymentDialog";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getOrderByJobApplication } from "@/api/orderApi";

export default function ApplicationCard({
  application,
  onAccept,
  onReject,
  onShortlist,
  onViewProfile,
  jobId,
  jobData,
}) {
  const navigate = useNavigate();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [orderPaymentData, setOrderPaymentData] = useState(null);
  const [isSelectingFreelancer, setIsSelectingFreelancer] = useState(false);

  // Fetch order data if application is accepted
  const { data: orderData } = useQuery({
    queryKey: ['order', jobId, application?._id],
    queryFn: () => getOrderByJobApplication(jobId, application?._id),
    enabled: application?.status === 'accepted' && !!jobId && !!application?._id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Status configuration with colors
  const statusConfig = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending Review",
    },
    under_review: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Under Review",
    },
    shortlisted: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      label: "Shortlisted",
    },
    accepted: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Accepted",
    },
    rejected: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Rejected",
    },
    withdrawn: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Withdrawn",
    },
  };

  const currentStatus =
    statusConfig[application.status] || statusConfig.pending;

  const formatAppliedTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase();
  };

  const canTakeAction = () => {
    return ["pending", "under_review", "shortlisted"].includes(
      application.status
    );
  };
  const applicant = application?.applicant_id || application?.applicant || {};
  const {
    _id,
    firstName,
    lastName,
    publicName,
    fullName,
    avatar,
    avatarUrl,
    imageUrl,
    profile_image_url,
    profileImageUrl,
    picture,
    skills,
  } = applicant;

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    publicName ||
    fullName ||
    applicant?.name ||
    "Freelancer";

  const applicantAvatar =
    avatarUrl ||
    avatar ||
    imageUrl ||
    profileImageUrl ||
    profile_image_url ||
    picture ||
    applicant?.profile?.avatar ||
    applicant?.profile?.imageUrl ||
    null;

  const applicantSkills = Array.isArray(skills) && skills.length
    ? skills
    : Array.isArray(application?.applicant?.skills)
      ? application?.applicant?.skills
      : [];

  const applicantExperience =
    applicant?.headline ||
    applicant?.experience ||
    application?.applicant?.experience ||
    "";

  const applicantId =
    _id ||
    applicant?.id ||
    application?.applicant?.id ||
    application?.applicant_id?._id;

  const handleSelectFreelancer = async () => {
    setIsSelectingFreelancer(true);
    try {
      // Calculate payment amount and open payment dialog
      const jobBudget = jobData?.budget || application?.proposed_budget || 0;
      const platformFeeRate = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || 10) / 100;
      const platformFee = Math.round(jobBudget * platformFeeRate * 100) / 100;
      const totalAmount = jobBudget + platformFee;

      setOrderPaymentData({
        jobId,
        applicationId: application?._id,
        jobBudget,
        platformFee,
        totalAmount
      });

      // Open payment dialog
      setIsPaymentDialogOpen(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    } finally {
      setIsSelectingFreelancer(false);
    }
  };

  const handlePaymentSuccess = async (paymentMethodId) => {
    try {
      // Process payment for application (order-based hiring)
      const response = await api.post(`/api/jobs/${jobId}/pay-application`, {
        applicationId: application?._id,
        paymentMethodId
      });

      if (response.data.success) {
        toast.success('Payment processed successfully! Freelancer has been selected.');
        setIsPaymentDialogOpen(false);

        // Trigger parent refresh if needed
        if (onAccept) {
          onAccept(jobId, application?._id);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleContactFreelancer = () => {
    if (!applicantId) return;
    navigate(`/messages?userId=${applicantId}`);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header with applicant info */}
          <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-slate-600">
                {applicantAvatar ? (
                  <AvatarImage
                    src={applicantAvatar}
                    alt={displayName}
                  />
                ) : null}
                <AvatarFallback className="bg-slate-700 text-slate-300">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3
                  className="font-bold text-lg text-white hover:text-blue-400 transition-colors cursor-pointer"
                  onClick={() => onViewProfile(applicantId)}
                >
                  {displayName}
                </h3>
                <p className="text-slate-400 text-sm">
                  {applicantExperience}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`${currentStatus?.color} border`}>
                {currentStatus?.label}
              </Badge>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {applicantSkills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="border-slate-600 text-slate-300 text-xs"
              >
                {skill}
              </Badge>
            ))}
            {applicantSkills.length > 4 && (
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300 text-xs"
              >
                +{applicantSkills.length - 4} more
              </Badge>
            )}
          </div>

          {/* Cover Letter Preview */}
          {application?.cover_letter && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">
                  Cover Letter
                </span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-3 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
                {application?.cover_letter}
              </p>
            </div>
          )}

          {/* Portfolio Links */}
          {application?.portfolio_links &&
            application?.portfolio_links?.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">
                    Portfolio
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application?.portfolio_links
                    ?.slice(0, 2)
                    ?.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Portfolio {index + 1}
                      </a>
                    ))}
                  {application?.portfolio_links?.length > 2 && (
                    <span className="text-xs text-slate-500">
                      +{application?.portfolio_links?.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Application Details */}
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/50 mb-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-slate-400">
                <DollarSign className="h-4 w-4" />
                <span>${application?.proposed_budget}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {application?.estimated_delivery
                    ? `${Math?.ceil(
                        (new Date(application?.estimated_delivery) -
                          new Date()) /
                          (1000 * 60 * 60 * 24)
                      )} days`
                    : "TBD"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs">
                {formatAppliedTime(application?.applied_at)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {canTakeAction() && (
            <TooltipProvider>
              <div className="flex gap-2 mt-auto">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                  onClick={handleSelectFreelancer}
                  disabled={isSelectingFreelancer}
                >
                  {isSelectingFreelancer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Select Freelancer
                    </>
                  )}
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => onShortlist(jobId, application?._id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-slate-700">
                    <p>Shortlist</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                      onClick={() => onReject(application?._id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-slate-700">
                    <p>Reject Application</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                      onClick={handleContactFreelancer}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-slate-700">
                    <p>Contact Freelancer</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}

          {/* Status Actions for Accepted/Rejected */}
          {application?.status === "accepted" && (
            <div className="mt-auto space-y-2">
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={() => onViewProfile(applicantId)}
              >
                View Profile & Contact
              </Button>

              {/* View Order Button */}
              {orderData && (
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                  onClick={() => navigate(`/orders/${orderData._id}`)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  View Order Details
                </Button>
              )}
            </div>
          )}

          {application?.status === "rejected" && application?.client_notes && (
            <div className="mt-auto p-3 bg-red-900/20 rounded-lg border border-red-700/50">
              <p className="text-xs text-red-400">
                <strong>Rejection Note:</strong> {application?.client_notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Dialog - Shows immediately after selecting freelancer */}
      {orderPaymentData && (
        <MilestonePaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          jobDetails={{
            title: jobData?.title || "Job Payment",
          }}
          milestone={{
            title: "Job Payment",
            amount: orderPaymentData.jobBudget,
          }}
          paymentAmount={orderPaymentData.totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
          isJobPayment={true}
        />
      )}
    </motion.div>
  );
}
