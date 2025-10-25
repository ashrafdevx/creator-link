import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MultiSelect from "../components/ui/MultiSelect";
import { Loader2, Plus, Edit, Trash2, User as UserIcon, Upload, Camera } from "lucide-react";
import { useActivityTracker } from "../components/tracking/ActivityTracker";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import ImageUploader from "../components/ui/ImageUploader";
import UserStatusToggle from "../components/users/UserStatusToggle";
import { createPageUrl } from "@/utils";

const ROLES = [
  "Long Form Editor",
  "Short Form Editor",
  "Thumbnail Design",
  "Scriptwriting",
  "Channel Strategy",
  "Clipping",
  "Animation",
  "SEO/Title Optimization",
];
const NICHES = [
  "Gaming",
  "Beauty",
  "Sports",
  "IRL",
  "Finance",
  "Comedy",
  "Tech",
  "Educational",
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    public_name: "",
    profile_image_url: "",
    headline: "",
    bio: "",
    roles: [],
    niches: [],
    software_skills: "",
    portfolio_links: "",
    portfolio_items: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { user, trackActivity } = useActivityTracker();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        // Load or create freelancer profile
        // const profiles = await FreelancerProfile?.filter({ user_id: user.id });
        const profiles = 0;
        if (profiles?.length > 0) {
          const fetchedProfile = profiles[0];
          setProfile(fetchedProfile);
          setFormData({
            public_name: user.public_name || user.full_name,
            profile_image_url: user.profile_image_url || user.picture,
            headline: fetchedProfile.headline || "",
            bio: fetchedProfile.bio || "",
            roles: fetchedProfile.roles || [],
            niches: fetchedProfile.niches || [],
            software_skills: (fetchedProfile.software_skills || []).join(", "),
            portfolio_links: (fetchedProfile.portfolio_links || []).join(", "),
            portfolio_items: fetchedProfile.portfolio_items || [],
          });

          // Load services for this profile
          const userServices = await Service.filter({
            freelancer_profile_id: fetchedProfile.id,
          });
          setServices(userServices);
        } else {
          setIsEditing(true); // No profile, go straight to edit mode
          setFormData((prev) => ({
            ...prev,
            public_name: user.public_name || user.full_name,
            profile_image_url: user.profile_image_url || user.picture,
          }));
        }
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    const profileDataToSave = {
      headline: formData.headline,
      bio: formData.bio,
      roles: formData.roles,
      niches: formData.niches,
      software_skills: formData.software_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      portfolio_links: formData.portfolio_links
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      user_id: user.id,
      portfolio_items: formData.portfolio_items,
    };

    const userDataToSave = {
      public_name: formData.public_name,
      profile_image_url: formData.profile_image_url,
    };

    try {
      // Update user data first
      await User.updateMyUserData(userDataToSave);

      let currentProfile;
      if (profile) {
        await FreelancerProfile.update(profile.id, profileDataToSave);
        currentProfile = { ...profile, ...profileDataToSave };
      } else {
        currentProfile = await FreelancerProfile.create(profileDataToSave);
      }
      setProfile(currentProfile); // Set the updated or newly created profile

      await trackActivity("profile_update");
      setIsEditing(false);

      // Load services, now using currentProfile.id (which is set after create/update)
      const userServices = await Service.filter({
        freelancer_profile_id: currentProfile.id,
      });
      setServices(userServices);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusUpdate = async (isOnline) => {
    setIsUpdatingStatus(true);
    try {
      // Static implementation - replace with actual API call
      // await updateUserStatus(user.id, { is_online: isOnline });
      
      // Mock update for UI demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await trackActivity("status_update");
      console.log(`Status updated to: ${isOnline ? "Online" : "Offline"}`);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await Service.delete(serviceId);
        const userServices = await Service.filter({
          freelancer_profile_id: profile.id,
        });
        setServices(userServices);
        alert("Service deleted successfully!");
      } catch (error) {
        console.error("Failed to delete service:", error);
        alert("Failed to delete service. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Status Toggle - Only show when not editing */}
      {!isEditing && user && (
        <div className="mb-6">
          <UserStatusToggle 
            user={user}
            onStatusUpdate={handleStatusUpdate}
            isUpdating={isUpdatingStatus}
          />
        </div>
      )}
      
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                  <UserIcon className="w-8 h-8" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  {user.public_name || user.full_name}
                </CardTitle>
                <CardDescription className="text-slate-200">
                  Manage your public specialist profile and service offerings
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Public Name
                  </label>
                  <Input
                    value={formData.public_name}
                    onChange={(e) =>
                      handleInputChange("public_name", e.target.value)
                    }
                    placeholder="Your display name"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Profile Picture
                  </label>
                  <div className="space-y-3">
                    <ImageUploader
                      onUpload={(url) =>
                        handleInputChange("profile_image_url", url)
                      }
                    />
                    {formData.profile_image_url && (
                      <div className="flex items-center gap-3">
                        <img
                          src={formData.profile_image_url}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                            onClick={() => document.getElementById('file-input')?.click()}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Change Photo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleInputChange("profile_image_url", "")}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload logic here
                          console.log("File selected:", file.name);
                          // This would normally upload the file and return a URL
                          // For now, create a temporary URL for preview
                          const tempUrl = URL.createObjectURL(file);
                          handleInputChange("profile_image_url", tempUrl);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Headline
                </label>
                <Input
                  value={formData.headline}
                  onChange={(e) =>
                    handleInputChange("headline", e.target.value)
                  }
                  placeholder="e.g., Expert Gaming Long Form Editor"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Bio
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Your Roles
                </label>
                <MultiSelect
                  options={ROLES}
                  selected={formData.roles}
                  onChange={(value) => handleInputChange("roles", value)}
                  colorScheme="blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Your Niches
                </label>
                <MultiSelect
                  options={NICHES}
                  selected={formData.niches}
                  onChange={(value) => handleInputChange("niches", value)}
                  colorScheme="purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Software Skills (comma-separated)
                </label>
                <Input
                  value={formData.software_skills}
                  onChange={(e) =>
                    handleInputChange("software_skills", e.target.value)
                  }
                  placeholder="e.g., Adobe Premiere Pro, Photoshop"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Portfolio Links (comma-separated)
                </label>
                <Input
                  value={formData.portfolio_links}
                  onChange={(e) =>
                    handleInputChange("portfolio_links", e.target.value)
                  }
                  placeholder="e.g., https://youtube.com/..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <p className="text-xl font-semibold text-slate-200">
                {profile.headline}
              </p>
              <p className="text-slate-200 whitespace-pre-wrap">
                {profile.bio}
              </p>
              <div>
                <h4 className="font-semibold mb-2 text-white">Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.roles?.map((r) => (
                    <Badge key={r} className="bg-blue-600">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Niches</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.niches?.map((n) => (
                    <Badge key={n} className="bg-purple-600">
                      {n}
                    </Badge>
                  ))}
                </div>
              </div>
              {profile.software_skills &&
                profile.software_skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-white">
                      Software Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.software_skills.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {profile.portfolio_items &&
                profile.portfolio_items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4 text-white">Portfolio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.portfolio_items.map((item, index) => (
                        <PortfolioCard key={index} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              {profile.portfolio_links &&
                profile.portfolio_links.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-white">
                      Portfolio Links
                    </h4>
                    <ul className="list-disc list-inside text-slate-200">
                      {profile.portfolio_links.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ) : (
            <p className="text-slate-200">
              You haven't set up your specialist profile yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Your Services
              </CardTitle>
              <CardDescription className="text-slate-300">
                Manage your service offerings that clients can purchase
              </CardDescription>
            </div>
            
          </div>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">
                      {service.title}
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-600">{service.role}</Badge>
                    <span className="font-bold text-green-400">
                      ${service.starting_price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Delivery: {service.delivery_time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No services created yet</p>
              <p className="text-sm">
                Create your first service offering to start earning
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
