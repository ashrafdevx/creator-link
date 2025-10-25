import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Share2,
  Briefcase,
  Star,
  Eye,
  MessageSquare,
  Globe,
  Play,
  ExternalLink,
  Copy,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { createPageUrl } from "@/utils";
import { useJob } from "@/hooks/jobs/useJobSearch";
import { timeAgo } from "@/utils/time";
import SaveButton from "@/components/saved/SaveButton";
import { useAuth } from "@/hooks/useAuth";


export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // route like: /jobs/:jobId
  const { isSignedIn } = useAuth();
  const { data, isLoading: isLoadingJob, isError, error } = useJob(id);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleBackClick = () => {
    navigate("/find-jobs");
  };

  const handleApplyClick = () => {
    navigate(`/JobApplication/${id}`);
  };

  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const jobTitle = data?.data?.title || "Check out this job";
    const shareText = `${jobTitle} - ${currentUrl}`;

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      copy: currentUrl
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl).then(() => {
        toast.success("Link copied to clipboard!");
        setShareModalOpen(false);
      }).catch(() => {
        toast.error("Failed to copy link");
      });
    } else {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
      setShareModalOpen(false);
    }
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  const getRoleColor = (role) => {
    const colors = {
      "Long Form Editor": "bg-blue-100 text-blue-800 border-blue-200",
      "Short Form Editor": "bg-green-100 text-green-800 border-green-200",
      "Thumbnail Design": "bg-purple-100 text-purple-800 border-purple-200",
      Scriptwriting: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getNicheColor = (niche) => {
    const colors = {
      Gaming: "bg-red-100 text-red-800",
      Tech: "bg-indigo-100 text-indigo-800",
      Beauty: "bg-pink-100 text-pink-800",
      Finance: "bg-emerald-100 text-emerald-800",
    };
    return colors[niche] || "bg-slate-100 text-slate-800";
  };
  if (isLoadingJob)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <SaveButton
              itemType="job"
              itemId={id}
              size="sm"
              variant="outline"
              className="border-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-white mb-3 leading-tight">
                      {data?.data?.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {timeAgo(data?.data?.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Remote
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {data?.data?.applicant_count} applicants
                      </span>
                      {/* <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        2.3k views
                      </span> */}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    Open
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {data?.data?.role_needed && (
                    <Badge className={getRoleColor(data?.data?.role_needed)}>
                      <Briefcase className="w-3 h-3 mr-1" />
                      {data?.data?.role_needed}
                    </Badge>
                  )}
                  {data?.data?.niches?.map((niche) => (
                    niche && (
                      <Badge key={niche} className={getNicheColor(niche)}>
                        {niche}
                      </Badge>
                    )
                  ))}
                </div>

                {/* Budget and Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-slate-400">Budget</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      ${data?.data?.budget.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Deadline</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {data?.data?.deadline &&
                        format(data?.data?.deadline, "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  About the Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                    {data?.data?.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skills and Software */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Preferred Software
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.data?.software_preference ? (
                  <div className="flex flex-wrap gap-2">
                    {data.data.software_preference
                      .split(", ")
                      .filter((software) => software.trim())
                      .map((software) => (
                        <Badge
                          key={software}
                          className="bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {software}
                        </Badge>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No preferred software specified</p>
                )}
              </CardContent>
            </Card>


            {/* Application Questions */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Questions from Client
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Questions you'll need to answer when applying
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.data?.application_questions && data.data.application_questions.length > 0 ? (
                  <div className="space-y-4">
                    {data.data.application_questions.map((question, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="bg-blue-600 text-white text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {question.question_text}
                            </p>
                            {question.is_required && (
                              <p className="text-sm text-red-400 mt-1">
                                * Required
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No questions from client</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Button
                  onClick={handleApplyClick}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 mb-4"
                  size="lg"
                >
                  Apply Now
                </Button>
                
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">Posted by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={data?.data?.client_id?.avatar}
                      alt={`${data?.data?.client_id?.firstName} ${data?.data?.client_id?.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-600">
                      {getInitials(
                        data?.data?.client_id?.firstName,
                        data?.data?.client_id?.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-white  cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/user/${data?.data?.client_id?._id}`
                        )
                      }
                    >
                      {data?.data?.client_id?.firstName}{" "}
                      {data?.data?.client_id?.lastName}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {data?.data?.client_id?.companyName}
                    </p>
                    {(data?.data?.client_id?.avgRating > 0 || data?.data?.client_id?.totalReviews > 0) && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-white font-medium">
                          {data?.data?.client_id?.avgRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-sm text-slate-400">
                          ({data?.data?.client_id?.totalReviews || 0} {data?.data?.client_id?.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(data?.data?.client_id?.companyName || data?.data?.client_id?.jobsPosted) && (
                  <>
                    <Separator className="bg-slate-600 my-4" />
                    <div className="space-y-3 text-sm">
                      {data?.data?.client_id?.companyName && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Company</span>
                          <span className="text-white">
                            {data.data.client_id.companyName}
                          </span>
                        </div>
                      )}
                      {data?.data?.client_id?.jobsPosted !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Jobs posted</span>
                          <span className="text-white">
                            {data.data.client_id.jobsPosted}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

             
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Similar Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.data?.similarJobs?.map((job) => (
                    <div
                      key={job.id}
                      className="pb-4 last:pb-0 last:border-0 border-b border-slate-600"
                    >
                      <h4 className="font-medium text-white text-sm mb-2 line-clamp-2">
                        {job.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400 font-semibold">
                          ${job.budget}
                        </span>
                        <span className="text-slate-400">
                          {job.applicants} applicants
                        </span>
                      </div>
                      <Badge className={getRoleColor(job.role)} size="sm">
                        {job.role}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
                  size="sm"
                >
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Share Modal */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Share this Job</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                onClick={() => handleShare('whatsapp')}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
                </svg>
                WhatsApp
              </Button>

              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>

              <Button
                onClick={() => handleShare('x')}
                variant="outline"
                className="border-slate-300 text-slate-200 hover:bg-slate-300/10 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </Button>

              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="border-slate-500 text-slate-300 hover:bg-slate-500/10 h-12"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
