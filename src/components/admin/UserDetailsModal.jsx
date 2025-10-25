import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminService } from '@/api/adminService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Star,
  Briefcase,
  Activity,
  Shield,
  Phone,
  Globe,
  UserCheck,
  TrendingUp,
  Wallet,
  CreditCard,
  Eye,
  Settings,
  Image,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const UserDetailsModal = ({ user, open, onOpenChange }) => {
  const queryClient = useQueryClient();

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (userId) => adminService.resetUserPassword(userId),
    onSuccess: () => {
      toast.success('Password reset email sent to user');
    },
    onError: (error) => {
      toast.error(`Failed to reset password: ${error.message}`);
    }
  });

  const handleResetPassword = () => {
    if (window.confirm(`Send password reset email to ${user.email}?`)) {
      resetPasswordMutation.mutate(user._id);
    }
  };

  if (!user) return null;

  const getStatusBadge = (isActive) => {
    return isActive
      ? { variant: 'default', label: 'Active', color: 'text-green-600' }
      : { variant: 'destructive', label: 'Inactive', color: 'text-red-600' };
  };

  const getRoleBadge = (role) => {
    const variants = {
      freelancer: { variant: 'default', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      client: { variant: 'secondary', color: 'bg-green-50 text-green-700 border-green-200' },
      'super-admin': { variant: 'destructive', color: 'bg-red-50 text-red-700 border-red-200' }
    };
    return variants[role] || variants.freelancer;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    // Handle MongoDB date format { $date: "2025-09-23T18:47:47.015Z" }
    const dateString = dateValue.$date || dateValue;

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const statusConfig = getStatusBadge(user.isActive);
  const roleConfig = getRoleBadge(user.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete profile information for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section with Avatar and Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={roleConfig.color}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                    <Badge variant={user.isEmailVerified ? 'outline' : 'secondary'}
                           className={user.isEmailVerified ? 'text-green-600 border-green-300' : 'text-yellow-600 border-yellow-300'}>
                      {user.isEmailVerified ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Email Verified</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Email Unverified</>
                      )}
                    </Badge>
                    {user.stripeConnectAccountId && (
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Stripe Connected
                      </Badge>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.location.city}, {user.location.country}
                      {user.location.timezone && (
                        <span className="text-muted-foreground ml-1">(UTC{user.location.timezone})</span>
                      )}
                    </span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-blue-600 hover:underline">
                      {user.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Account Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Last active: {formatDate(user.lastActive)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user.loginCount} total logins
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user.profileViews || 0} profile views
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Information */}
          {user.balance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-green-700">
                        ${user.balance.available.toFixed(2)}
                      </div>
                      <p className="text-sm text-green-600">Available Balance</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        ${user.balance.pending.toFixed(2)}
                      </div>
                      <p className="text-sm text-yellow-600">Pending</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {user.balance.currency}
                      </div>
                      <p className="text-sm text-blue-600">Currency</p>
                    </CardContent>
                  </Card>
                </div>

                {user.paymentSettings && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Payment Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Payout Schedule:</span>
                        <p className="font-medium capitalize">{user.paymentSettings.payoutSchedule}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payout Threshold:</span>
                        <p className="font-medium">${user.paymentSettings.payoutThreshold}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Portfolio Items */}
          {user.portfolioItems && user.portfolioItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Portfolio ({user.portfolioItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.portfolioItems.map((item, index) => (
                  <div key={item._id?.$oid || index} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      {item.imageUrl && (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{item.category}</Badge>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                               className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              View Project
                            </a>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDate(item.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.role === 'client' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{user.jobsPosted || 0}</p>
                    <p className="text-sm text-blue-600 mt-1">Jobs Posted</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">{user.jobsCompleted || 0}</p>
                    <p className="text-sm text-green-600 mt-1">Jobs Completed</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">
                      ${user.statistics?.totalSpent?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">{user.totalReviews || 0}</p>
                    <p className="text-sm text-yellow-600 mt-1">Reviews Given</p>
                  </div>
                </div>
              )}

              {user.role === 'freelancer' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{user.jobsCompleted || 0}</p>
                    <p className="text-sm text-blue-600 mt-1">Jobs Completed</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">
                      ${user.statistics?.totalEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-green-600 mt-1">Total Earned</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{user.avgRating || 0}</p>
                    <p className="text-sm text-purple-600 mt-1">Avg Rating</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">{user.totalReviews || 0}</p>
                    <p className="text-sm text-yellow-600 mt-1">Total Reviews</p>
                  </div>
                </div>
              )}

              {(user.role === 'staff' || user.role === 'super-admin') && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Admin accounts do not have activity metrics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Information (for freelancers) */}
          {user.role === 'freelancer' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.availability && (
                    <div>
                      <p className="text-sm font-medium mb-1">Availability</p>
                      <Badge variant="outline" className={
                        user.availability === 'available' ? 'text-green-600 border-green-300' :
                        user.availability === 'busy' ? 'text-yellow-600 border-yellow-300' :
                        'text-red-600 border-red-300'
                      }>
                        {user.availability.charAt(0).toUpperCase() + user.availability.slice(1)}
                      </Badge>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{user.avgRating || 0}</span>
                      <span className="text-muted-foreground">
                        ({user.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {user.skills && user.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {user.jobsCompleted || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {user.avgRating || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {user.totalReviews || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Information */}
          {user.role === 'client' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.companyName && (
                  <div>
                    <p className="text-sm font-medium mb-1">Company</p>
                    <p>{user.companyName}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {user.jobsPosted || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Jobs Posted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {user.avgRating || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Client Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Information */}
          {user.role === 'super-admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Super Administrator Account</p>
                    <p className="text-sm text-muted-foreground">
                      Has full access to platform management features including:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                      <li>• User management and suspension</li>
                      <li>• Financial oversight and transactions</li>
                      <li>• Platform analytics and reporting</li>
                      <li>• Support ticket management</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isLoading}
            >
              {resetPasswordMutation.isLoading ? 'Sending...' : 'Reset Password'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
