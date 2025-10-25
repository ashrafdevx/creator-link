import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useOrderDetail } from '@/hooks/useOrderOperations';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import OrderActions from '@/components/orders/OrderActions';
import { calculateTimeRemaining } from '@/api/orderApi';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  Clock,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  FileText,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Download,
  Star,
  MapPin,
  Package,
  AlertTriangle
} from 'lucide-react';

const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining(dueDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(dueDate));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [dueDate]);

  return (
    <div className={`text-center p-4 rounded-lg ${timeLeft.isOverdue ? 'bg-red-900/20' : 'bg-slate-700'}`}>
      {timeLeft.isOverdue ? (
        <>
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-lg font-semibold text-red-400">Overdue</p>
        </>
      ) : (
        <>
          <div className="flex justify-center gap-4 mb-2">
            <div>
              <p className="text-2xl font-bold text-white">{timeLeft.days}</p>
              <p className="text-xs text-slate-400">Days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{timeLeft.hours}</p>
              <p className="text-xs text-slate-400">Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{timeLeft.minutes}</p>
              <p className="text-xs text-slate-400">Minutes</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Time Remaining</p>
        </>
      )}
    </div>
  );
};

const MilestoneCard = ({ milestone, index }) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                Milestone {index + 1}
              </Badge>
              {milestone.payment_status === 'paid' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/20 text-xs">
                  Paid
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-white">{milestone.title}</h4>
            {milestone.description && (
              <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>
            )}
          </div>
          <p className="text-lg font-semibold text-white">${milestone.amount}</p>
        </div>

        {milestone.due_date && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Due {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {milestone.status === 'delivered' && milestone.deliverables?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Deliverables</p>
            {milestone.deliverables.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <span className="text-sm text-white">{file.file_name}</span>
                <Button size="sm" variant="ghost" className="text-blue-400">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading, error } = useOrderDetail(orderId);

  // Load Crisp chat widget for support
  useEffect(() => {
    if (!window.$crisp) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = "7b243eca-abe5-422a-9118-10a1249a26b4";

      const script = document.createElement("script");
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.getElementsByTagName("head")[0].appendChild(script);
    }

    return () => {
      if (window.$crisp) {
        window.$crisp.push(['do', 'chat:hide']);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Order Not Found</h3>
        <p className="text-slate-400 mb-4">{error.message}</p>
        <Button onClick={() => navigate('/orders')} variant="outline">
          Back to Orders
        </Button>
      </div>
    );
  }

  // Get user ID and role from auth context
  // The app uses user.user._id (with underscore) for MongoDB IDs
  const userId = user?.user?._id || user?._id || user?.user?.id || user?.id;
  const userRole = user?.user?.role || user?.role;

  // Since we don't have userId but we have userRole, use role-based detection
  // This is sufficient for showing the correct UI based on whether user is client or freelancer
  const isClient = userRole === 'client';
  const isFreelancer = userRole === 'freelancer';

  // If we have userId, double-check with ID comparison for extra safety
  if (userId) {
    const isClientById = userId === order.client_id._id || userId === order.client_id.id;
    const isFreelancerById = userId === order.freelancer_id._id || userId === order.freelancer_id.id;

    // Log any mismatch for debugging
    if ((isClient && !isClientById) || (isFreelancer && !isFreelancerById)) {
      console.warn('Role and ID mismatch detected', {
        roleBasedClient: isClient,
        idBasedClient: isClientById,
        roleBasedFreelancer: isFreelancer,
        idBasedFreelancer: isFreelancerById
      });
    }
  }

  const otherParty = isClient ? order.freelancer_id : order.client_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <Button
        onClick={() => navigate('/orders')}
        variant="ghost"
        className="mb-6 text-slate-400 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

     

      {/* Order Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-slate-400">{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <CardTitle className="text-2xl text-white">{order.title}</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {order.order_type === 'job' ? 'Job Order' : 'Gig Order'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Check if description contains an error message and handle it gracefully */}
              <p className="text-slate-300 mb-6">
                {order.description && !order.description.includes('Error finalizing order')
                  ? order.description
                  : (order.job_id?.description || 'No description available')}
              </p>

              {/* Order Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={order.client_id.profilePicture} />
                    <AvatarFallback>{order.client_id.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-slate-400">Client</p>
                    <p className="text-sm font-medium text-white">
                      {order.client_id.firstName} {order.client_id.lastName}
                      {isClient && ' (You)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={order.freelancer_id.profilePicture} />
                    <AvatarFallback>{order.freelancer_id.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-slate-400">Freelancer</p>
                    <p className="text-sm font-medium text-white">
                      {order.freelancer_id.firstName} {order.freelancer_id.lastName}
                      {isFreelancer && ' (You)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Order Value</p>
                  <p className="text-lg font-semibold text-white">
                    ${(order.freelancer_earnings || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
                <OrderActions order={order} userRole={userRole || (isClient ? 'client' : 'freelancer')} />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Section (shown when order is delivered - for clients to review) */}
          {order.status === 'delivered' && order.single_delivery && isClient && (
            <Card className="bg-slate-800/50 border-slate-700 mt-6 border-2 border-purple-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5 text-purple-400" />
                  Order Delivery
                  <Badge className="ml-auto bg-purple-100 text-purple-800 border-purple-200">
                    Review Required
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Message */}
                {order.single_delivery.description && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Delivery Message</h4>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <p className="text-white">{order.single_delivery.description}</p>
                    </div>
                  </div>
                )}

                {/* Delivered Files */}
                {order.single_delivery.deliverables && order.single_delivery.deliverables.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Delivered Files ({order.single_delivery.deliverables.length})
                    </h4>
                    <div className="space-y-2">
                      {order.single_delivery.deliverables.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-white">{file.file_name}</p>
                              {file.file_size && (
                                <p className="text-xs text-slate-400">
                                  {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
                            onClick={async () => {
                              try {
                                const fileKey = btoa(file.s3_key || file.file_url.split('.com/')[1]);
                                const { data } = await api.get(`/api/orders/download/${order._id}/${fileKey}`);
                                if (data.success) {
                                  window.open(data.data.downloadUrl, '_blank');
                                } else {
                                  toast.error('Failed to download file');
                                }
                              } catch (error) {
                                console.error('Download failed:', error);
                                toast.error('Failed to download file');
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Date */}
                <div className="flex items-center gap-2 text-sm text-slate-400 pt-2 border-t border-slate-700">
                  <Clock className="w-4 h-4" />
                  <span>
                    Delivered {formatDistanceToNow(new Date(order.delivered_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Section for Freelancers (read-only view of what was delivered) */}
          {order.status === 'delivered' && order.single_delivery && isFreelancer && (
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5 text-green-400" />
                  Your Delivery
                  <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
                    Delivered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Message */}
                {order.single_delivery.description && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Your Delivery Message</h4>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <p className="text-white">{order.single_delivery.description}</p>
                    </div>
                  </div>
                )}

                {/* Delivered Files */}
                {order.single_delivery.deliverables && order.single_delivery.deliverables.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Files You Delivered ({order.single_delivery.deliverables.length})
                    </h4>
                    <div className="space-y-2">
                      {order.single_delivery.deliverables.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-white">{file.file_name}</p>
                              {file.file_size && (
                                <p className="text-xs text-slate-400">
                                  {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">Delivered</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Info */}
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    <span className="text-green-400">✓</span> Delivered {formatDistanceToNow(new Date(order.delivered_at), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Awaiting client review and approval
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm text-slate-300">Deadline</CardTitle>
              </CardHeader>
              <CardContent>
                <CountdownTimer dueDate={order.due_date} />
                <p className="text-xs text-slate-400 text-center mt-3">
                  Due {format(new Date(order.due_date), 'PPP')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Order Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-slate-300">Order Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Created</span>
                <span className="text-sm text-white">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              {order.started_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Started</span>
                  <span className="text-sm text-white">
                    {format(new Date(order.started_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Delivered</span>
                  <span className="text-sm text-white">
                    {format(new Date(order.delivered_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {order.revision_count > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Revisions</span>
                  <span className="text-sm text-white">
                    {order.revision_count} / {order.max_revisions}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Milestones Section */}
      {order.milestones?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.milestones.map((milestone, index) => (
              <MilestoneCard key={milestone._id} milestone={milestone} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Requirements Section */}
      {order.requirements && (
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Order Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{order.requirements}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline Section */}
      <OrderTimeline order={order} currentUserId={userId} />
    </div>
  );
};

export default OrderDetail;
