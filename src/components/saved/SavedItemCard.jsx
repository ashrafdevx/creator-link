import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  DollarSign,
  Calendar,
  User,
  Star,
  ExternalLink,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import SaveButton from "./SaveButton";

export default function SavedItemCard({
  savedItem,
  onViewDetails,
  onRemove,
  showRemoveButton = true,
}) {
  const {
    item_type: itemType,
    item_id: itemId,
    item,
    metadata,
    createdAt,
    saved_at: savedAt
  } = savedItem;

  const getItemTitle = () => {
    return item?.title || metadata?.title || 'Untitled';
  };

  const getItemDescription = () => {
    return item?.description || metadata?.description || 'No description available';
  };

  const getItemPrice = () => {
    if (itemType === 'job') {
      return item?.budget || metadata?.budget || 0;
    } else if (itemType === 'gig') {
      // Get minimum price from packages or metadata
      if (item?.packages) {
        const prices = [
          item.packages.basic?.price,
          item.packages.standard?.price,
          item.packages.premium?.price,
        ].filter(price => price != null && price > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
      } else if (metadata?.basic_info?.price_range) {
        return metadata.basic_info.price_range.min || 0;
      }
      return 0;
    }
    return 0;
  };

  const getItemAuthor = () => {
    if (itemType === 'job') {
      return item?.client_id || item?.creator;
    } else if (itemType === 'gig') {
      return item?.freelancer_id;
    }
    return null;
  };

  const getItemBadge = () => {
    if (itemType === 'job') {
      return item?.role_needed || metadata?.role_needed || 'Job';
    } else if (itemType === 'gig') {
      return item?.category || metadata?.basic_info?.category || 'Gig';
    }
    return itemType;
  };

  const getItemTiming = () => {
    if (itemType === 'job') {
      const deadline = item?.deadline || metadata?.deadline;
      return deadline ? `Due ${format(new Date(deadline), "MMM d")}` : 'No deadline';
    } else if (itemType === 'gig') {
      const deliveryTime = item?.packages?.basic?.delivery_time_days || metadata?.basic_info?.delivery_time;
      return deliveryTime ? `${deliveryTime} days delivery` : 'No delivery time';
    }
    return '';
  };

  const author = getItemAuthor();

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const getAuthorName = () => {
    if (author?.firstName && author?.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author?.name || author?.full_name || 'Unknown';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="bg-slate-800/70 border-slate-700 rounded-xl overflow-hidden h-full flex flex-col group p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={
                  itemType === 'job'
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }
              >
                {getItemBadge()}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {itemType === 'job' ? 'Job' : 'Gig'}
              </Badge>
            </div>
            <h3
              className="font-bold text-xl text-white line-clamp-2 group-hover:text-blue-400 transition-colors pr-4 cursor-pointer"
              onClick={() => onViewDetails && onViewDetails(itemId, itemType)}
            >
              {getItemTitle()}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton
              itemType={itemType}
              itemId={itemId}
              size="icon"
              variant="ghost"
            />
            {showRemoveButton && (
              <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={() => onRemove && onRemove(savedItem)}
                title="Remove from saved"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
          {getItemDescription()}
        </p>

        {author && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8 border-2 border-slate-600">
              <AvatarImage
                src={author?.avatar || author?.profile_image_url}
                alt={getAuthorName()}
              />
              <AvatarFallback>
                {getInitials(getAuthorName())}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-200 text-sm">
                {getAuthorName()}
              </p>
              {itemType === 'gig' && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>5.0 (12)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing and timing */}
        <div className="flex justify-between items-center border-t border-slate-700 pt-3 mb-4">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{getItemTiming()}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">
              {itemType === 'job' ? 'Budget' : 'Starting at'}
            </div>
            <div className="font-bold text-lg text-green-400">
              ${getItemPrice()}
            </div>
          </div>
        </div>

        {/* Saved date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Saved {format(new Date(savedAt || createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-auto">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => onViewDetails && onViewDetails(itemId, itemType)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}