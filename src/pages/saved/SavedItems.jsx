import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  ArrowLeft,
  Trash2,
  Filter,
  Calendar,
  Briefcase,
  Lightbulb
} from "lucide-react";
import { useSavedItems } from "@/hooks/saved/useSavedItems";
import { useUnsaveItem } from "@/hooks/saved/useSaveItem";
import { useAuth } from "@/hooks/useAuth";
import SavedItemCard from "@/components/saved/SavedItemCard";
import { toast } from "sonner";

export default function SavedItems() {
  const { user, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const unsaveItem = useUnsaveItem();

  // Fetch saved items based on active tab
  const getItemTypeForTab = (tab) => {
    switch (tab) {
      case "jobs": return "job";
      case "gigs": return "gig";
      default: return null; // "all"
    }
  };

  const {
    data: currentTabData,
    isLoading,
    error: errorAll
  } = useSavedItems(getItemTypeForTab(activeTab));

  // Check authentication
  useEffect(() => {
    if (!isSignedIn) {
      toast.error("Please sign in to view saved items");
      navigate("/auth");
      return;
    }
  }, [isSignedIn, navigate]);

  const currentData = currentTabData?.data?.data?.savedItems || [];

  const handleViewDetails = (itemId, itemType) => {
    if (itemType === "job") {
      navigate(`/JobDetails/${itemId}`);
    } else if (itemType === "gig") {
      navigate(`/gigs/${itemId}`);
    }
  };

  const handleRemoveSingle = (savedItem) => {
    const { item_type: itemType, item_id: itemId } = savedItem;
    unsaveItem.mutate({ itemType, itemId });
  };

  const handleBulkRemove = () => {
    selectedItems.forEach((savedItem) => {
      const { item_type: itemType, item_id: itemId } = savedItem;
      unsaveItem.mutate({ itemType, itemId });
    });
    setSelectedItems([]);
    setIsSelectionMode(false);
    toast.success(`Removed ${selectedItems.length} items from saved`);
  };

  const toggleItemSelection = (savedItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item =>
        item.item_id === savedItem.item_id && item.item_type === savedItem.item_type
      );

      if (isSelected) {
        return prev.filter(item =>
          !(item.item_id === savedItem.item_id && item.item_type === savedItem.item_type)
        );
      } else {
        return [...prev, savedItem];
      }
    });
  };


  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  if (errorAll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Card className="bg-red-100 border-red-300">
            <CardContent className="p-6 text-center">
              <p className="text-red-700">
                Error loading saved items: {errorAll.message}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Saved Items</h1>
              <p className="text-slate-400">Your bookmarked jobs and gigs</p>
            </div>

            {currentData.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsSelectionMode(!isSelectionMode)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {isSelectionMode ? "Cancel Selection" : "Select Items"}
                </Button>

                {isSelectionMode && selectedItems.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBulkRemove}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove {selectedItems.length} Items
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border-slate-700">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                <Bookmark className="mr-2 h-4 w-4" />
                All ({currentTabData?.data?.data?.pagination?.total || 0})
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Jobs {activeTab === "jobs" ? `(${currentTabData?.data?.data?.pagination?.total || 0})` : ""}
              </TabsTrigger>
              <TabsTrigger
                value="gigs"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Gigs {activeTab === "gigs" ? `(${currentTabData?.data?.data?.pagination?.total || 0})` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-slate-800/70 border-slate-700 h-80 animate-pulse">
                        <div className="p-5 space-y-4">
                          <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                          <div className="h-20 bg-slate-600 rounded"></div>
                          <div className="h-8 bg-slate-600 rounded w-1/3"></div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : currentData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {currentData.map((savedItem, index) => (
                      <motion.div
                        key={`${savedItem.item_type}-${savedItem.item_id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {isSelectionMode && (
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedItems.some(item =>
                                item.item_id === savedItem.item_id &&
                                item.item_type === savedItem.item_type
                              )}
                              onChange={() => toggleItemSelection(savedItem)}
                              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </div>
                        )}

                        <SavedItemCard
                          savedItem={savedItem}
                          onViewDetails={handleViewDetails}
                          onRemove={handleRemoveSingle}
                          showRemoveButton={!isSelectionMode}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="text-center">
                    <Bookmark className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No saved {activeTab === "all" ? "items" : activeTab} yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Start saving {activeTab === "all" ? "jobs and gigs" : activeTab} you're interested in
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate("/jobs")}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Browse Jobs
                      </Button>
                      <Button
                        onClick={() => navigate("/gigs")}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Browse Gigs
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}