import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateGig, useToggleGigStatus } from "@/hooks/gigs/useGigMutations";
import { useGigImageUpload } from "@/hooks/gigs/useGigImageUpload";
import { toast } from "sonner";

const GIG_CATEGORIES = [
  "Video Editing",
  "Graphic Design",
  "Content Writing",
  "Social Media Management",
  "SEO Optimization",
  "Animation",
  "Web Development",
  "Photography",
  "Audio Editing",
  "Thumbnail Design",
  "Scriptwriting",
  "Channel Strategy",
];

export default function CreateGig() {
  const { user, isSignedIn } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;
  const navigate = useNavigate();
  const createGig = useCreateGig({ showToast: false });
  const toggleGigStatus = useToggleGigStatus();
  const { uploadImage, isUploading, uploadProgress } = useGigImageUpload();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    image_url: "",
    packages: {
      basic: {
        price: "",
        description: "",
        delivery_time_days: "",
      },
      standard: {
        price: "",
        description: "",
        delivery_time_days: "",
      },
      premium: {
        price: "",
        description: "",
        delivery_time_days: "",
      },
    },
  });

  const [newTag, setNewTag] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [gigCreated, setGigCreated] = useState(false);
  const [createdGigId, setCreatedGigId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [gigPublished, setGigPublished] = useState(false);

  // Check auth and permissions
  React.useEffect(() => {
    if (!isSignedIn) {
      toast.error("Please sign in to create a gig");
      navigate("/auth");
      return;
    }

    if (role?.toLowerCase() !== "freelancer") {
      toast.error("Only freelancers can create gigs");
      navigate("/");
      return;
    }
  }, [isSignedIn, role, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageChange = (packageType, field, value) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          [field]: value,
        },
      },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    setIsImageUploaded(false);
    setUploadedImageUrl("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadedImageUrl("");
    setIsImageUploaded(false);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const handleImageUpload = async (gigId) => {
    if (!selectedImage || !gigId) {
      return null;
    }

    try {
      const uploadResult = await uploadImage(selectedImage, gigId);

      if (uploadResult.success) {
        setUploadedImageUrl(uploadResult.publicUrl);
        setIsImageUploaded(true);
        return uploadResult.publicUrl;
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error(`Failed to upload image: ${error.message}`);
      return null;
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (formData.title.length < 10 || formData.title.length > 80) {
      toast.error("Title must be between 10 and 80 characters");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (formData.description.length < 120 || formData.description.length > 1000) {
      toast.error("Description must be between 120 and 1000 characters");
      return false;
    }

    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }

    // Validate packages
    const packages = ["basic", "standard", "premium"];
    for (const pkg of packages) {
      const packageData = formData.packages[pkg];

      if (!packageData.price || packageData.price < 5) {
        toast.error(`${pkg.charAt(0).toUpperCase() + pkg.slice(1)} package price must be at least $5`);
        return false;
      }

      if (!packageData.description.trim()) {
        toast.error(`${pkg.charAt(0).toUpperCase() + pkg.slice(1)} package description is required`);
        return false;
      }

      if (!packageData.delivery_time_days || packageData.delivery_time_days < 1) {
        toast.error(`${pkg.charAt(0).toUpperCase() + pkg.slice(1)} package delivery time is required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (gigCreated || createGig.isPending) {
      console.log('Submission blocked - already created or pending:', { gigCreated, isPending: createGig.isPending });
      return;
    }

    if (!validateForm()) {
      return;
    }

    console.log('Starting gig creation...');
    console.log('Form data before processing:', formData);

    try {
      const gigData = {
        ...formData,
        packages: {
          basic: {
            ...formData.packages.basic,
            price: Number(formData.packages.basic.price),
            delivery_time_days: Number(formData.packages.basic.delivery_time_days),
          },
          standard: {
            ...formData.packages.standard,
            price: Number(formData.packages.standard.price),
            delivery_time_days: Number(formData.packages.standard.delivery_time_days),
          },
          premium: {
            ...formData.packages.premium,
            price: Number(formData.packages.premium.price),
            delivery_time_days: Number(formData.packages.premium.delivery_time_days),
          },
        },
      };

      // Create the gig (will be created with status: 'draft' by default)
      console.log('Sending gig data:', gigData);
      const response = await createGig.mutateAsync(gigData);
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);

      const newGigId = response.data?.data?._id;
      console.log('Extracted gig ID:', newGigId);

      if (!newGigId) {
        console.error('Failed to extract gig ID. Full response structure:', JSON.stringify(response, null, 2));
        throw new Error('Failed to get gig ID from response');
      }

      // Mark as created to prevent multiple submissions
      setGigCreated(true);
      setCreatedGigId(newGigId);

      // If there's an image, upload it to AWS and update the gig
      if (selectedImage) {
        await handleImageUpload(newGigId);
        // The upload hook's confirm method will automatically update the gig with the image URL
      }

      toast.success("Draft saved successfully!");

    } catch (error) {
      console.error("Failed to create gig:", error);
      toast.error("Failed to save draft. Please try again.");
      setGigCreated(false);
      setCreatedGigId(null);
    }
  };

  const handlePublishGig = async () => {
    if (!createdGigId) {
      toast.error("Please save the draft first");
      return;
    }

    try {
      setIsPublishing(true);

      await toggleGigStatus.mutateAsync({
        gigId: createdGigId,
        status: 'active'
      });

      setGigPublished(true);
      toast.success("Congratulations! Your gig has been published successfully!");

    } catch (error) {
      console.error("Failed to publish gig:", error);
      toast.error("Failed to publish gig. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isSignedIn || role?.toLowerCase() !== "freelancer") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/gigs")}
            className="text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">Create New Gig</h1>
          <p className="text-slate-400">Create a professional gig to showcase your services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Gig Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="I will create amazing thumbnails for your YouTube channel"
                  maxLength={80}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                  disabled={gigCreated}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.title.length}/80 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your gig in detail. What will you deliver? What makes your service unique?"
                  minLength={120}
                  maxLength={1000}
                  rows={5}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                  disabled={gigCreated}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.description.length}/1000 characters (minimum 120)
                </p>
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} disabled={gigCreated}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GIG_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-white">Tags (up to 5)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={formData.tags.length >= 5 || gigCreated}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    disabled={formData.tags.length >= 5 || gigCreated}
                    className="border-slate-600 text-slate-300"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-slate-600 text-white"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-auto p-0 text-slate-300 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Gig Image</CardTitle>
              <p className="text-slate-400">Upload an image to showcase your gig (optional)</p>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-slate-700">
                    <img
                      src={uploadedImageUrl || imagePreview}
                      alt="Gig preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {isImageUploaded && (
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        ✓ Uploaded to AWS
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">
                      Image selected: {selectedImage?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label
                    htmlFor="gig-image"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        JPEG, PNG, or WebP (max 10MB)
                      </p>
                    </div>
                    <input
                      id="gig-image"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      disabled={gigCreated}
                    />
                  </label>
                </div>
              )}

              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-slate-400 mb-1">
                    <span>Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Packages */}
          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Packages</CardTitle>
              <p className="text-slate-400">Define your three service tiers</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["basic", "standard", "premium"].map((packageType) => (
                  <div key={packageType} className="space-y-4">
                    <h3 className="font-semibold text-white capitalize text-lg">
                      {packageType} Package
                    </h3>

                    <div>
                      <Label className="text-white">
                        Price ($) <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="5"
                        step="1"
                        value={formData.packages[packageType].price}
                        onChange={(e) => handlePackageChange(packageType, "price", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        disabled={gigCreated}
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-white">
                        Description <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        value={formData.packages[packageType].description}
                        onChange={(e) => handlePackageChange(packageType, "description", e.target.value)}
                        placeholder={`What's included in the ${packageType} package?`}
                        maxLength={100}
                        rows={3}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        disabled={gigCreated}
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {formData.packages[packageType].description.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <Label className="text-white">
                        Delivery Time (days) <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.packages[packageType].delivery_time_days}
                        onChange={(e) => handlePackageChange(packageType, "delivery_time_days", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        disabled={gigCreated}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="space-y-4">
            {gigCreated && !gigPublished && (
              <div className="text-center p-4 bg-green-900/50 border border-green-700 rounded-lg">
                <p className="text-green-400 font-medium">
                  ✓ Draft saved successfully! You can now publish your gig to make it live.
                </p>
              </div>
            )}

            {gigPublished && (
              <div className="text-center p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-lg">
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  🎉 Congratulations!
                </h3>
                <p className="text-green-300 mb-4">
                  Your gig has been published successfully and is now live on the platform!
                </p>
                <Button
                  onClick={() => navigate("/my-gigs")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  Go to My Gigs
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/gigs")}
                disabled={createGig.isPending || isUploading || isPublishing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>

              {!gigCreated ? (
                <Button
                  type="submit"
                  disabled={createGig.isPending || isUploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  {createGig.isPending || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </Button>
              ) : !gigPublished ? (
                <Button
                  type="button"
                  onClick={handlePublishGig}
                  disabled={isPublishing}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Gig"
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
