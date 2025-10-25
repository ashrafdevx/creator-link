import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ChevronLeft, ChevronRight, Bookmark, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getEmbedUrl } from '../videoUtils';

const ImageCarousel = ({ galleryItems }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    if (!galleryItems || galleryItems.length === 0) {
        return (
            <div className="aspect-video bg-slate-900 flex items-center justify-center">
                <div className="text-slate-500 text-center">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Star className="w-6 h-6" />
                    </div>
                    <p className="text-sm">No portfolio items</p>
                </div>
            </div>
        );
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
    const videoEmbedUrl = isVideo ? getEmbedUrl(currentItem.url) : null;

    return (
        <div className="relative aspect-video bg-slate-900 overflow-hidden group">
            {isVideo && videoEmbedUrl ? (
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
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const StarRating = ({ rating, reviewCount }) => (
    <div className="flex items-center gap-1">
        <Star className={`h-4 w-4 ${rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
        <span className="font-medium text-slate-200">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
        <span className="text-sm text-slate-400">({reviewCount || 0})</span>
    </div>
);

export default function ServiceCard({ service, onFavoriteToggle, isFavorited, onViewDetails }) {
  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || 'U';

  const freelancer = service.freelancer;
  const user = freelancer?.user;
  
  const displayName = user?.public_name || user?.full_name || "Anonymous Specialist";
  const profileImage = user?.profile_image_url || user?.picture;
  const reviewCount = freelancer?.reviews?.length || 0;
  const averageRating = freelancer?.average_rating || 0;
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full cursor-pointer"
      onClick={() => onViewDetails(service.id)}
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group">
        <div className="relative">
            <ImageCarousel galleryItems={service.gallery_items} />
            <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-3 right-3 text-slate-200 bg-slate-800/60 hover:bg-slate-800/80 rounded-full shadow-sm"
                onClick={(e) => { e.stopPropagation(); onFavoriteToggle(service.id, 'service'); }}
            >
                <Bookmark className={`h-4 w-4 transition-all ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
            </Button>
        </div>

        <div className="p-4 flex-grow flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-slate-600 flex-shrink-0">
                    {profileImage ? (
                        <AvatarImage src={profileImage} className="object-cover" />
                    ) : (
                        <AvatarFallback className="text-sm bg-slate-700 text-slate-200">
                            <User className="w-5 h-5" />
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200 truncate">{displayName}</p>
                    <StarRating rating={averageRating} reviewCount={reviewCount} />
                </div>
            </div>

            <h3 className="font-semibold text-slate-100 text-lg mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors flex-grow">
                {service.title}
            </h3>
            
            <div className="flex justify-between items-center border-t border-slate-700 pt-3 mt-auto">
                <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">~{service.delivery_time}</span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400">Starting at</div>
                    <div className="font-bold text-lg text-green-400">${service.starting_price}</div>
                </div>
            </div>
        </div>
      </Card>
    </motion.div>
  );
}