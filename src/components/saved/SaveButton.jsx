import React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { useSaveItem, useUnsaveItem } from "@/hooks/saved/useSaveItem";
import { useCheckSaved } from "@/hooks/saved/useSavedItems";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SaveButton({
  itemType,
  itemId,
  size = "icon",
  variant = "ghost",
  showLabel = false,
  className = "",
}) {
  const { isSignedIn } = useAuth();
  const { data: savedStatus, isLoading: isCheckingStatus } = useCheckSaved(itemType, itemId);
  const saveItem = useSaveItem();
  const unsaveItem = useUnsaveItem();

  const isSaved = savedStatus?.data?.data?.isSaved;
  const isLoading = isCheckingStatus || saveItem.isPending || unsaveItem.isPending;

  const handleToggleSave = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save items");
      return;
    }

    if (!itemType || !itemId) {
      toast.error("Invalid item");
      return;
    }

    if (isSaved) {
      unsaveItem.mutate({ itemType, itemId });
    } else {
      saveItem.mutate({ itemType, itemId });
    }
  };

  const getButtonStyle = () => {
    if (variant === "ghost") {
      return isSaved
        ? "!text-yellow-500 hover:!text-yellow-600 hover:bg-yellow-50/10"
        : "!text-slate-400 hover:!text-white hover:bg-slate-700/50";
    }
    return "";
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`transition-all ${getButtonStyle()} ${className}`}
      title={isSaved ? "Remove from saved" : "Save item"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark
          className={`h-4 w-4 transition-all ${
            isSaved ? "!fill-yellow-500 !text-yellow-500 scale-110" : "fill-none"
          }`}
        />
      )}
      {showLabel && (
        <span className="ml-2">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}