// src/components/ProfileEditModal.jsx
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Edit, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateFreelancerProfile } from "@/hooks/Freelancer/useGetFreelancerProfile";

// Validation schema
const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio can be at most 1000 characters")
    .optional()
    .default(""),
  skillsStr: z.string().transform((v) =>
    v
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  ),
  availability: z.enum(
    ["available", "busy", "away", "offline", "unavailable"],
    {
      errorMap: () => ({ message: "Select a valid availability" }),
    }
  ),
  location: z.object({
    country: z.string().trim().min(1, "Country is required"),
    city: z.string().trim().min(1, "City is required"),
    timezone: z.string().trim().min(1, "Timezone is required"),
  }),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
});

export default function ProfileEditModal({
  defaultValues,
  triggerAsChild,
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isLoading } = useUpdateFreelancerProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      bio: defaultValues?.bio ?? "",
      skillsStr: (defaultValues?.skills ?? []).join(", "),
      availability: defaultValues?.availability ?? "available",
      location: {
        country: defaultValues?.location?.country ?? "",
        city: defaultValues?.location?.city ?? "",
        timezone: defaultValues?.location?.timezone ?? "",
      },
      website: defaultValues?.website ?? "",
    },
    mode: "onSubmit",
  });

  // Reset form when defaultValues change
  useEffect(() => {
    reset({
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      bio: defaultValues?.bio ?? "",
      skillsStr: (defaultValues?.skills ?? []).join(", "),
      availability: defaultValues?.availability ?? "available",
      location: {
        country: defaultValues?.location?.country ?? "",
        city: defaultValues?.location?.city ?? "",
        timezone: defaultValues?.location?.timezone ?? "",
      },
      website: defaultValues?.website ?? "",
    });
  }, [defaultValues, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio || "",
        skills: values.skillsStr, // array from transform
        availability: values.availability,
        location: {
          country: values.location.country,
          city: values.location.city,
          timezone: values.location.timezone,
        },
        website: values.website || undefined,
      };

      await mutateAsync(payload);
      setIsOpen(false); // Close modal on success
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Handle error (toast notification, etc.)
    }
  };

  const isProcessing = isSubmitting || isLoading;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      <Dialog.Trigger asChild={triggerAsChild}>
        {children || (
          <button
            type="button"
            className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
            aria-label="Edit profile"
            title="Edit profile"
          >
            <Edit className="h-5 w-5 text-white hover:text-blue-400 cursor-pointer transition-colors" />
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in-0" />

        {/* Modal Content */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[95vw] max-w-2xl max-h-[95vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-800 border border-slate-700 p-0 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 overflow-hidden"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <Dialog.Title className="text-xl font-semibold text-white">
              Edit Profile
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Close"
                disabled={isProcessing}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form Content - Scrollable */}
          <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    First Name
                  </label>
                  <input
                    {...register("firstName")}
                    disabled={isProcessing}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register("lastName")}
                    disabled={isProcessing}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  {...register("bio")}
                  disabled={isProcessing}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Skills
                  <span className="text-slate-400 text-xs ml-2">
                    (comma separated)
                  </span>
                </label>
                <input
                  {...register("skillsStr")}
                  disabled={isProcessing}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. React, Node.js, TypeScript, UI/UX Design"
                />
                {errors.skillsStr && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {errors.skillsStr.message}
                  </p>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Availability
                </label>
                <select
                  {...register("availability")}
                  disabled={isProcessing}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                {errors.availability && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {errors.availability.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-200 mb-4">
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      placeholder="Country"
                      {...register("location.country")}
                      disabled={isProcessing}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.location?.country && (
                      <p className="mt-1.5 text-sm text-red-400">
                        {errors.location.country.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="City"
                      {...register("location.city")}
                      disabled={isProcessing}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.location?.city && (
                      <p className="mt-1.5 text-sm text-red-400">
                        {errors.location.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="Timezone (e.g. UTC+5)"
                      {...register("location.timezone")}
                      disabled={isProcessing}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.location?.timezone && (
                      <p className="mt-1.5 text-sm text-red-400">
                        {errors.location.timezone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Website
                  <span className="text-slate-400 text-xs ml-2">
                    (optional)
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://johndoe.com"
                  {...register("website")}
                  disabled={isProcessing}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {errors.website && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {errors.website.message}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </Dialog.Close>

            <button
              type="submit"
              form="profile-form"
              onClick={handleSubmit(onSubmit)}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
