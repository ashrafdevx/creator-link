import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActivityTracker } from "../components/tracking/ActivityTracker";
import { createPageUrl } from "@/utils";
import MultiSelect from "../components/ui/MultiSelect";
import TagInput from "../components/ui/TagInput";
import ApplicationQuestions from "../components/jobs/ApplicationQuestions";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/utils/authUtils";
import { createApiClient } from "@/api/apiClient";
import { useJobById, useUpdateJob } from "@/hooks/jobs/useJobSearch";
import { toast } from "sonner";

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

export default function PostJob() {
  const { isSignedIn, user } = useAuth();
  const { id: routeId } = useParams(); // supports /jobs/post/:id
  const [searchParams] = useSearchParams(); // supports /jobs/post?id=...
  const paramId = searchParams.get("id");
  const jobId = routeId || paramId || null;

  // Create the client once
  const apiClient = useMemo(() => createApiClient(getValidAccessToken), []);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    role_needed: "",
    niches: [],
    budget: "",
    deadline: "",
    software_preference: [],
    application_questions: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { trackActivity } = useActivityTracker();

  // Edit mode hooks
  const isEdit = Boolean(jobId);
  const { data: job, isLoading: isLoadingJob } = useJobById(jobId, isEdit);
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob();

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && job) {
      // Keep only editable fields populated to avoid accidental extra updates
      console.log("job", job);
      setFormData((prev) => ({
        ...prev,
        title: job.data.title || "",
        description: job.data.description || "",
        budget: job.data.budget ?? "",
        // Convert ISO/Timestamp to yyyy-mm-dd for <input type="date">
        deadline: job.data.deadline
          ? normalizeToDateInput(job.data.deadline)
          : "",
        // Convert comma-separated string to array for TagInput
        software_preference: job.data.software_preference
          ? job.data.software_preference.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        // Leave non-edit fields as-is; they won't render in edit mode anyway
      }));
    }
  }, [isEdit, job]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: key === "software_preference" ? value : value,
    }));
  };

  const toCommaString = (val) => {
    if (!val) return "";
    const parts = (Array.isArray(val) ? val.join(",") : String(val))
      .split(/[,;\n]+/)
      .map((s) => s.trim().replace(/\s+/g, " "))
      .filter(Boolean);

    const seen = new Set();
    const cleaned = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push(p);
      }
    }
    return cleaned.join(", ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please sign in to continue.");
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        // EDIT MODE — only send editable fields
        const payload = {
          title: formData.title,
          description: formData.description,
          budget: Number(formData.budget),
          ...(formData.deadline
            ? { deadline: toIsoMidnight(formData.deadline) }
            : {}),
          software_preference: formData.software_preference.join(', '),
        };

        await updateJob({ id: jobId, payload });
        toast.success("Job updated successfully!");

        // Stay on **the same page** (you asked to redirect here).
        // If you want to go to job detail instead, replace with: navigate(`/jobs/${jobId}`)
        navigate(0); // refresh same route to show latest values
        return;
      }

      // CREATE MODE — original behavior (unchanged)
      const jobData = {
        creator_id: user?.id,
        title: formData.title,
        description: formData.description,
        role_needed: formData.role_needed,
        niches: formData.niches,
        budget: Number(formData.budget),
        software_preference: formData.software_preference.join(', '),
        application_questions: formData.application_questions,
        ...(formData.deadline ? { deadline: formData.deadline } : {}),
      };

      const res = await apiClient.post("/api/jobs", jobData);

      if (trackActivity) {
        await trackActivity("job_post", {
          role: formData.role_needed,
          niches: formData.niches,
        });
      }

      toast.success("Job posted successfully!");
      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      console.error("Submit failed:", err);

      // Check if there are specific validation errors in the response
      const errorData = err?.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // Show each validation error
        errorData.errors.forEach(error => toast.error(error));
      } else {
        // Fallback to generic message
        const msg =
          errorData?.message ||
          err?.message ||
          "There was an error. Please try again.";
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = isEdit ? "Update Job" : "Post a New Job";
  const pageDesc = isEdit
    ? "Edit only the fields allowed for updates."
    : "Fill out the details below to find the perfect specialist for your project.";

  const primaryBtnLabel = isEdit
    ? isUpdating || isLoading
      ? "Updating..."
      : "Update Job"
    : isLoading
    ? "Publishing..."
    : "Post Job";

  const isBusy = isLoading || isUpdating || isLoadingJob;

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      {/* Back to Dashboard Button */}
      <div className="flex justify-between items-center my-8 ">
        <Link to={createPageUrl("Dashboard")} className="">
          <Button
            variant="outline"
            className="border-slate-600 bg-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              {pageTitle}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {pageDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ---- COMMON/EDITABLE FIELDS (always visible) ---- */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-2 text-slate-200"
              >
                Job Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., 'Need an Editor for Gaming Montages'"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2 text-slate-200"
              >
                Job Description *
              </label>
              <Textarea
                id="description"
                placeholder="Describe the work, desired style, video length, etc."
                className="bg-slate-800 border-slate-700 h-32 text-white placeholder:text-slate-400"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>

            {/* ---- CREATE-ONLY FIELDS ---- */}
            {!isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Role Needed *
                  </label>
                  <Select
                    value={formData.role_needed}
                    onValueChange={(value) =>
                      handleInputChange("role_needed", value)
                    }
                    required
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {ROLES.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700 hover:text-white focus:text-white"
                        >
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Channel Niches (select multiple) *
                  </label>
                  <MultiSelect
                    options={NICHES}
                    selected={formData.niches}
                    onChange={(value) => handleInputChange("niches", value)}
                    colorScheme="purple"
                  />
                </div>
              </>
            )}

            {/* ---- SHARED FIELDS: budget/deadline/software (editable) ---- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium mb-2 text-slate-200"
                >
                  Budget ($) *
                </label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 150"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium mb-2 text-slate-200"
                >
                  Deadline {isEdit ? "" : "(optional)"}
                </label>
                <Input
                  id="deadline"
                  type="date"
                  className="bg-slate-800 border-slate-700 text-white"
                  value={formData.deadline}
                  onChange={(e) =>
                    handleInputChange("deadline", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="software"
                className="block text-sm font-medium mb-2 text-slate-200"
              >
                Preferred Software
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Type a software name and press Enter to add it as a tag
              </p>
              <TagInput
                tags={formData.software_preference}
                onChange={(tags) =>
                  handleInputChange("software_preference", tags)
                }
                placeholder="e.g., Premiere Pro (press Enter to add)"
              />
            </div>
          </CardContent>
        </Card>

        {/* CREATE-ONLY: Application Questions */}
        {!isEdit && (
          <ApplicationQuestions
            questions={formData.application_questions}
            onChange={(questions) =>
              handleInputChange("application_questions", questions)
            }
          />
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isBusy}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {primaryBtnLabel}
              </>
            ) : (
              primaryBtnLabel
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Helpers */
function normalizeToDateInput(value) {
  // Accepts ISO or timestamp and returns "yyyy-mm-dd"
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function toIsoMidnight(yyyyMmDd) {
  // Convert "2025-09-20" -> "2025-09-20T00:00:00.000Z"
  try {
    const [y, m, d] = yyyyMmDd.split("-").map((n) => parseInt(n, 10));
    const iso = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
    return iso;
  } catch {
    return new Date(yyyyMmDd).toISOString();
  }
}
