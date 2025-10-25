
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, MessageSquare, Loader2, Play, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getEmbedUrl } from '../components/videoUtils';
import { getUserDataForMessaging } from '../components/utils/userDataHelpers';

export default function ServiceDetails() {
  const [service, setService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContacting, setIsContacting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (!id) {
        navigate(createPageUrl('FindFreelancers'));
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        // Load current user first
        let user = null;
        try {
          user = await User.me();
          setCurrentUser(user);
        } catch (e) {
          console.log('No user logged in');
        }

        const serviceData = await Service.get(id);
        if (!serviceData) {
          throw new Error("Service not found.");
        }

        const profileData = await FreelancerProfile.get(serviceData.freelancer_profile_id);
        
        // Use our standardized user data helper
        const userData = await getUserDataForMessaging(profileData.user_id);

        setService({
          ...serviceData,
          freelancer: {
            ...profileData,
            user: userData
          }
        });
      } catch (err) {
        console.error("Failed to load service details:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServiceDetails();
  }, [location.search, navigate]);
  
  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || 'S';

  const handleContactClick = async () => {
    if (!currentUser) {
      alert('Please log in to contact this specialist');
      return;
    }
    
    const specialist = service?.freelancer?.user;
    if (!specialist?.id) {
      alert('Unable to contact specialist at this time. Please try again later.');
      return;
    }

    // Check if user is trying to contact themselves
    if (currentUser.id === specialist.id) {
      alert("You cannot contact yourself for your own service. This is your service listing.");
      return;
    }

    if (isContacting) return;

    setIsContacting(true);

    try {
      const specialistId = specialist.id;

      // 1. Check if a conversation already exists
      const existingConvos = await Conversation.filter({
        participant_ids: { $all: [currentUser.id, specialistId] }
      });

      let conversationId;
      if (existingConvos.length > 0) {
        // Use the existing conversation
        conversationId = existingConvos[0].id;
      } else {
        // 2. Create a new conversation
        const newConversation = await Conversation.create({
          participant_ids: [currentUser.id, specialistId],
          participant_info: [
            { user_id: currentUser.id, full_name: currentUser.full_name, profile_image_url: currentUser.profile_image_url || currentUser.picture },
            { user_id: specialistId, full_name: specialist.full_name, profile_image_url: specialist.profile_image_url || specialist.picture }
          ],
          last_message: `Conversation started about service: ${service.title}`
        });
        conversationId = newConversation.id;
      }
      
      // 3. Navigate to the messages page with the specific conversation ID
      navigate(createPageUrl(`Messages?conversation_id=${conversationId}`));

    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setIsContacting(false);
    }
  };

  const handleBackClick = () => {
    // Check if user came from FindFreelancers page
    if (document.referrer.includes('FindFreelancers')) {
      navigate(createPageUrl('FindFreelancers'));
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  if (isLoading) {
    return <div className="text-center p-10"><Loader2 className="mx-auto h-12 w-12 animate-spin text-white" /></div>;
  }
  
  if (error) {
     return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl text-white">Error Loading Service</h1>
        <p className="text-slate-400">{error}</p>
        <Button onClick={() => navigate(createPageUrl('FindFreelancers'))} className="mt-4">Back to Services</Button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl text-white">Service not found</h1>
        <p className="text-slate-400">This service may have been removed.</p>
        <Button onClick={() => navigate(createPageUrl('FindFreelancers'))} className="mt-4">Back to Services</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-0">
                        {/* Updated Gallery - All items in one scrollable section */}
                        {service.gallery_items && service.gallery_items.length > 0 ? (
                            <div className="relative">
                                <div className="aspect-video bg-slate-900 rounded-t-lg overflow-hidden">
                                    <ImageCarousel galleryItems={service.gallery_items} />
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-slate-900 rounded-t-lg flex items-center justify-center">
                                <div className="text-slate-500 text-center">
                                    <div className="w-12 h-12 bg-slate-700 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm">No preview available</p>
                                </div>
                            </div>
                        )}
                        <div className="p-6">
                            <Badge className="bg-blue-600 mb-4">{service.role}</Badge>
                            <h1 className="text-3xl font-bold text-white mb-4">{service.title}</h1>
                            <h2 className="text-lg font-semibold text-white mb-2">Service Description</h2>
                            <p className="text-slate-300 whitespace-pre-wrap">{service.description}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6 text-center">
                        <p className="text-slate-400">Starting at</p>
                        <p className="text-4xl font-bold text-green-400 mb-4">${service.starting_price}</p>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={handleContactClick}
                          disabled={isContacting || !currentUser || !service?.freelancer?.user || currentUser?.id === service?.freelancer?.user?.id}
                        >
                            {isContacting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                            ) : (
                                <MessageSquare className="w-4 h-4 mr-2"/>
                            )}
                            {currentUser?.id === service?.freelancer?.user?.id ? 'Your Service' : 'Contact Specialist'}
                        </Button>
                        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{service.delivery_time} Delivery</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4 text-center">About the Specialist</h3>
                         <div className="flex flex-col items-center text-center">
                            <Avatar className="h-20 w-20 mb-3">
                                <AvatarImage src={service.freelancer.user?.profile_image_url} className="object-cover" />
                                <AvatarFallback>{getInitials(service.freelancer.user?.full_name || 'Specialist')}</AvatarFallback>
                            </Avatar>
                            <h4 className="font-semibold text-white">{service.freelancer.user?.full_name || 'Specialist Profile'}</h4>
                            <p className="text-sm text-slate-300 mb-3">{service.freelancer.headline}</p>
                            <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-white">{service.freelancer.average_rating?.toFixed(1) || 'N/A'}</span>
                                <span className="text-slate-400">({service.freelancer.jobs_completed || 0} jobs)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

// Add ImageCarousel component for the gallery
const ImageCarousel = ({ galleryItems }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    if (!galleryItems || galleryItems.length === 0) {
        return null;
    }

    const goToPrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1));
    };
    
    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex === galleryItems.length - 1 ? 0 : prevIndex + 1));
    };
    
    const currentItem = galleryItems[currentIndex];
    const isVideo = currentItem?.type === 'video';
    const isTikTok = isVideo && currentItem.url.includes('tiktok.com');
    const videoEmbedUrl = isVideo ? getEmbedUrl(currentItem.url) : null;

    return (
        <div className="relative w-full h-full group">
            {isTikTok ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Play className="w-16 h-16 mx-auto mb-4" />
                        <p>TikTok Video</p>
                        <a href={currentItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            View on TikTok
                        </a>
                    </div>
                </div>
            ) : isVideo && videoEmbedUrl ? (
                <iframe
                    src={videoEmbedUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    title="Portfolio Video"
                ></iframe>
            ) : (
                <img src={currentItem?.url || currentItem?.thumbnail} alt="Service sample" className="w-full h-full object-cover" />
            )}

            {galleryItems.length > 1 && (
                <>
                    <button 
                        onClick={goToPrevious} 
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        onClick={goToNext} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                        <ChevronRight size={18} />
                    </button>
                </>
            )}
            
            {galleryItems.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {galleryItems.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                                index === currentIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
