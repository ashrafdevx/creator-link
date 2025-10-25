import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, DollarSign, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SaveButton from "@/components/saved/SaveButton";

export default function GigCard({
  gig,
  onViewDetails,
  showSaveButton = true,
}) {
  const getStartingPrice = () => {
    if (!gig.packages) return 0;
    const prices = [
      gig.packages.basic?.price,
      gig.packages.standard?.price,
      gig.packages.premium?.price,
    ].filter(price => price != null && price > 0);

    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "G";

  const startingPrice = getStartingPrice();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3
              className="font-bold text-xl text-white line-clamp-2 group-hover:text-blue-400 transition-colors pr-4 cursor-pointer"
              onClick={() => onViewDetails && onViewDetails(gig._id)}
            >
              {gig.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-purple-100 text-purple-700">
                {gig.category}
              </Badge>
              {gig.tags?.slice(0, 2).map((tag) => (
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
          {showSaveButton && (
            <div onClick={(e) => e.stopPropagation()}>
              <SaveButton
                itemType="gig"
                itemId={gig._id}
                size="icon"
                variant="ghost"
                className="rounded-full"
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          {gig.image_url ? (
            <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-slate-700">
              <img
                src={gig.image_url}
                alt={gig.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center bg-slate-700">
                <ImageIcon className="h-12 w-12 text-slate-500" />
              </div>
            </div>
          ) : (
            <div className="w-full h-48 mb-3 rounded-lg bg-slate-700 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-slate-500" />
            </div>
          )}
          <p className="text-slate-400 text-sm line-clamp-2 flex-grow">
            {gig.description}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <Avatar className="h-10 w-10 border-2 border-slate-600">
            <AvatarImage
              src={gig.freelancer_id?.avatar}
              alt={`${gig.freelancer_id?.firstName} ${gig.freelancer_id?.lastName}`}
            />
            <AvatarFallback>
              {getInitials(`${gig.freelancer_id?.firstName} ${gig.freelancer_id?.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-200">
              {gig.freelancer_id?.firstName} {gig.freelancer_id?.lastName}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{gig.freelancer_id?.avgRating ? gig.freelancer_id.avgRating.toFixed(1) : 'No rating'}</span>
              <span>({gig.freelancer_id?.totalReviews || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Pricing and delivery */}
        <div className="flex justify-between items-center border-t border-slate-700 pt-3 mt-auto">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {gig.packages?.basic?.delivery_time_days || 'N/A'} days delivery
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Starting at</div>
            <div className="font-bold text-lg text-green-400">
              ${startingPrice}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => onViewDetails && onViewDetails(gig._id)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 bg-white text-slate-800"
            variant="outline"
            onClick={() => onViewDetails && onViewDetails(gig._id)}
          >
            Select Package
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}