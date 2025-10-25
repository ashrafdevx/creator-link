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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Share2,
  Users,
  Tag,
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { useGigDetails } from "@/hooks/gigs/useGigDetails";
import { useAuth } from "@/hooks/useAuth";
import SaveButton from "../../components/saved/SaveButton";
import GigPackageCard from "../../components/gigs/GigPackageCard";
import GigPaymentDialog from "../../components/payments/GigPaymentDialog";
import { toast } from "sonner";

export default function GigDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isSignedIn } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const role = user?.role ?? user?.user?.role ?? null;

  const getDisabledReason = () => {
    if (!isSignedIn) return "Click to sign in and order this gig";
    if (role?.toLowerCase() !== "client") return "Login as client to order this gig";
    return null;
  };

  const getContactDisabledReason = () => {
    if (!isSignedIn) return "Click to sign in and contact freelancer";
    if (role?.toLowerCase() !== "client") return "Only clients can contact freelancers";
    return null;
  };

  const { data: gigData, isLoading, isError, error } = useGigDetails(id);
  const gig = gigData?.data?.data;

  const handleBackClick = () => {
    navigate("/gigs");
  };

  const handleOrderGig = (packageType) => {
    if (!isSignedIn) {
      // Store the current gig info in localStorage to redirect back after login
      localStorage.setItem('pendingOrder', JSON.stringify({
        gigId: id,
        packageType: packageType,
        returnUrl: window.location.pathname
      }));
      navigate("/auth");
      return;
    }

    if (role?.toLowerCase() !== "client") {
      toast.error("Only clients can order gigs");
      return;
    }

    // Open payment dialog
    setSelectedPackage(packageType);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (orderData) => {
    toast.success("Order created successfully!");
    // Navigate to order detail page
    navigate(`/orders/${orderData._id}`);
  };

  const handleContactFreelancer = () => {
    if (!isSignedIn) {
      // Store the current gig info in localStorage to redirect back after login
      localStorage.setItem('pendingContact', JSON.stringify({
        gigId: id,
        freelancerId: gig?.freelancer_id?._id,
        returnUrl: window.location.pathname
      }));
      navigate("/auth");
      return;
    }

    if (role?.toLowerCase() !== "client") {
      toast.error("Only clients can contact freelancers");
      return;
    }

    // Navigate to messages page with freelancer conversation
    const freelancerId = gig?.freelancer_id?._id;
    if (freelancerId) {
      // Create conversation URL with gig context
      navigate(`/messages?conversation_id=${freelancerId}&gig_id=${id}&gig_title=${encodeURIComponent(gig?.title || '')}`);
    } else {
      toast.error("Unable to contact freelancer");
    }
  };

  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const gigTitle = gig?.title || "Check out this amazing gig";
    const shareText = `${gigTitle} - ${currentUrl}`;

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      copy: currentUrl
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl).then(() => {
        toast.success("Link copied to clipboard!");
        setShareModalOpen(false);
      }).catch(() => {
        toast.error("Failed to copy link");
      });
    } else if (platform === 'instagram') {
      // Instagram doesn't have direct web sharing, so copy link instead
      navigator.clipboard.writeText(currentUrl).then(() => {
        toast.success("Link copied! You can paste it in Instagram.");
        setShareModalOpen(false);
      }).catch(() => {
        toast.error("Failed to copy link");
      });
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShareModalOpen(false);
    }
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  const getRecommendedPackage = () => {
    if (!gig?.packages) return "standard";

    // If there are 3 packages, recommend standard (middle option)
    const packages = Object.keys(gig.packages);
    if (packages.length === 3) return "standard";

    // Otherwise recommend the first available package
    return packages[0] || "standard";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-12 bg-slate-700 rounded w-3/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-slate-700 rounded"></div>
                <div className="h-32 bg-slate-700 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-slate-700 rounded"></div>
                <div className="h-48 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Button>
          <Card className="bg-red-100 border-red-300">
            <CardContent className="p-6 text-center">
              <p className="text-red-700">
                {error?.message || "Error loading gig"}
              </p>
              <Button
                onClick={handleBackClick}
                className="mt-4"
                variant="outline"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Button>
          <Card className="bg-red-100 border-red-300">
            <CardContent className="p-6 text-center">
              <p className="text-red-700">
                {error?.message || "Gig not found"}
              </p>
              <Button
                onClick={handleBackClick}
                className="mt-4"
                variant="outline"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gigs
        </Button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-purple-100 text-purple-700">
                  {gig.category}
                </Badge>
                {gig.tags?.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                {gig.title}
              </h1>

              {/* Freelancer Info */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12 border-2 border-slate-600">
                  <AvatarImage
                    src={gig.freelancer_id?.avatar}
                    alt={`${gig.freelancer_id?.firstName} ${gig.freelancer_id?.lastName}`}
                  />
                  <AvatarFallback>
                    {getInitials(gig.freelancer_id?.firstName, gig.freelancer_id?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {gig.freelancer_id?.firstName} {gig.freelancer_id?.lastName}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{gig.freelancer_id?.avgRating ? gig.freelancer_id.avgRating.toFixed(1) : 'No rating'}</span>
                      <span>({gig.freelancer_id?.totalReviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{gig.freelancer_id?.jobsCompleted || 0} orders</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <SaveButton
                itemType="gig"
                itemId={gig._id}
                size="default"
                showLabel={true}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                variant="outline"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShareModalOpen(true)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                title="Share gig"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {getContactDisabledReason() ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          onClick={handleContactFreelancer}
                          variant="outline"
                          className={`border-slate-600 text-slate-300 hover:bg-slate-700 ${
                            isSignedIn && role?.toLowerCase() !== "client" ? 'cursor-not-allowed' : ''
                          }`}
                          disabled={isSignedIn && role?.toLowerCase() !== "client"}
                        >
                          Contact Freelancer
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm">{getContactDisabledReason()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  onClick={handleContactFreelancer}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Contact Freelancer
                </Button>
              )}
            </div>
          </div>

          {/* Gig Stats */}
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Published {gig.createdAt && !isNaN(new Date(gig.createdAt)) ? format(new Date(gig.createdAt), "MMM d, yyyy") : "Unknown date"}</span>
            </div>
            <div className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              <span className="capitalize">{gig.status}</span>
            </div>
            {gig.stats && (
              <>
                <div className="flex items-center gap-1">
                  <span>{gig.stats.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{gig.stats.orders_completed} orders completed</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gig Image */}
            {gig.image_url ? (
              <Card className="bg-slate-800/70 border-slate-700 overflow-hidden">
                <div className="relative h-96 bg-slate-700">
                  <img
                    src={gig.image_url}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-slate-700 absolute inset-0">
                    <ImageIcon className="h-16 w-16 text-slate-500" />
                    <span className="ml-3 text-slate-500">Image not available</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800/70 border-slate-700">
                <div className="h-96 flex items-center justify-center bg-slate-700">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-slate-500 mx-auto mb-3" />
                    <span className="text-slate-500">No image available</span>
                  </div>
                </div>
              </Card>
            )}

            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">About This Gig</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {gig.description}
                </p>
              </CardContent>
            </Card>

            {/* About the Freelancer */}
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">About the Freelancer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-slate-600">
                    <AvatarImage
                      src={gig.freelancer_id?.avatar}
                      alt={`${gig.freelancer_id?.firstName} ${gig.freelancer_id?.lastName}`}
                    />
                    <AvatarFallback>
                      {getInitials(gig.freelancer_id?.firstName, gig.freelancer_id?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg mb-2">
                      {gig.freelancer_id?.firstName} {gig.freelancer_id?.lastName}
                    </h4>
                    <div className="flex gap-6 text-sm text-slate-400">
                      <p>Rating: {gig.freelancer_id?.avgRating ? `${gig.freelancer_id.avgRating}/5` : 'No rating'}</p>
                      <p>Total reviews: {gig.freelancer_id?.totalReviews || 0}</p>
                    </div>
                    {gig.freelancer_id?.skills && gig.freelancer_id.skills.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-white mb-2">Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {gig.freelancer_id.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Packages */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Choose a Package</h2>

              {gig.packages && ["basic", "standard", "premium"].map((packageType) => (
                gig.packages[packageType] && (
                  <GigPackageCard
                    key={packageType}
                    package={gig.packages[packageType]}
                    packageType={packageType}
                    onSelect={handleOrderGig}
                    recommended={packageType === getRecommendedPackage()}
                    disabled={isSignedIn && role?.toLowerCase() !== "client"}
                    disabledReason={getDisabledReason()}
                  />
                )
              ))}
            </div>

            {/* Additional Info */}
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gig Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Category</span>
                  <Badge className="bg-purple-100 text-purple-700">
                    {gig.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge className={`${gig.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {gig.status === 'active' ? 'Active' : gig.status ? gig.status.charAt(0).toUpperCase() + gig.status.slice(1) : 'Unknown'}
                  </Badge>
                </div>
                {gig.price_range && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Price Range</span>
                    <span className="text-white">${gig.price_range.min} - ${gig.price_range.max}</span>
                  </div>
                )}
                {gig.fastest_delivery && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fastest Delivery</span>
                    <span className="text-white">{gig.fastest_delivery} days</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Languages</span>
                  <span className="text-white">English</span>
                </div>
                <Separator className="bg-slate-600" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {gig.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Share Modal */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Share this Gig</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                onClick={() => handleShare('whatsapp')}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.390-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
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
                onClick={() => handleShare('twitter')}
                variant="outline"
                className="border-slate-400 text-slate-300 hover:bg-slate-500/10 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </Button>

              <Button
                onClick={() => handleShare('instagram')}
                variant="outline"
                className="border-pink-500 text-pink-400 hover:bg-pink-500/10 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </Button>
            </div>

            <Separator className="bg-slate-600 my-4" />

            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </DialogContent>
        </Dialog>

        {/* Gig Payment Dialog */}
        <GigPaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setSelectedPackage(null);
          }}
          gigData={gig}
          packageType={selectedPackage}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
}
