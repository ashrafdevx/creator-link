import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { createPageUrl, trackActivity } from "@/utils";
import ApplicationQuestionsInput from "../components/jobs/ApplicationQuestionsInput";
import { useApplyJob, useJobById } from "@/hooks/jobs/useJobSearch";
import { toast } from "sonner";

export default function JobApplication() {
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm({
    defaultValues: {
      cover_letter: "",
      proposed_budget: "",
      estimated_delivery: "",
      portfolio_links: "",
      relevant_experience: "",
      question_responses: [],
    },
    mode: "onBlur",
  });

  const { jobId } = useParams();
  const watchedValues = watch();
  const { data: jobById, isLoading: isLoadingJob } = useJobById(jobId);

  useEffect(() => {
    if (jobById?.data) {
      setJob(jobById.data);
      setUser({ id: 1, name: "John Doe" });
    }
  }, [jobById]);

  // Validation rules
  const validationRules = {
    cover_letter: {
      required: "Cover letter is required",
      minLength: {
        value: 30,
        message: "Cover letter must be at least 30 characters long",
      },
      maxLength: {
        value: 1000,
        message: "Cover letter must not exceed 1000 characters",
      },
    },
    proposed_budget: {
      required: "Proposed budget is required",
      min: {
        value: 5,
        message: "Budget must be at least $5",
      },
      max: {
        value: 100000,
        message: "Budget seems too high, please verify",
      },
    },
    portfolio_links: {
      validate: (value) => {
        if (!value) return true;
        const urls = value.split("\n").filter((url) => url.trim());
        const urlPattern =
          /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        for (let url of urls) {
          if (!urlPattern.test(url.trim())) {
            return "Please enter valid URLs (one per line)";
          }
        }
        return true;
      },
    },
    estimated_delivery: {
      validate: (value) => {
        if (!value) return true;
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate <= today) {
          return "Delivery date must be in the future";
        }
        return true;
      },
    },
  };

  // ✅ FIXED: Handle application questions validation
  const validateQuestionResponses = (responses) => {
    if (!job?.application_questions || job.application_questions.length === 0) {
      return true;
    }

    if (!Array.isArray(responses)) {
      return "Please answer the required questions.";
    }

    // Check required questions are filled
    for (let i = 0; i < job.application_questions.length; i++) {
      const question = job.application_questions[i];
      const response = responses[i];

      if (
        question.is_required &&
        (!response?.answer || !response.answer.trim())
      ) {
        return `Please answer: "${question.question_text}"`;
      }
    }
    return true;
  };

  // Initialize the mutation hook
  const applyJob = useApplyJob(jobId);

  // ✅ FIXED: Form submission handler
  const onSubmit = async (data) => {
    try {
      // Check if user is logged in
      if (!user) {
        toast.error("You must be logged in to apply.");
        return;
      }

      console.log("📋 Form data before processing:", data);

      // ✅ FIXED: Properly format application_answers
      const submissionData = {
        application_answers: (data.question_responses || []).map(
          (response, index) => ({
            question_text:
              job.application_questions[index]?.question_text || "",
            answer: response?.answer || "", // ✅ Extract the answer string properly
          })
        ),
        cover_letter: data.cover_letter?.trim() || "",
        proposed_budget: data.proposed_budget
          ? parseFloat(data.proposed_budget)
          : null,
        estimated_delivery: data.estimated_delivery
          ? new Date(data.estimated_delivery).toISOString()
          : null,
        portfolio_links: data.portfolio_links
          ? data.portfolio_links
              .split("\n")
              .filter((url) => url.trim())
              .map((url) => url.trim())
          : [],
        relevant_experience: data.relevant_experience?.trim() || "",
      };

      const response = await applyJob.mutateAsync(submissionData);

      toast.success(response?.message || "Applied for job successfully!");

      // Reset form and navigate
      reset();
      navigate("/find-jobs");
    } catch (error) {
      console.error("Failed to submit application:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit application";
      toast.error(errorMessage);
    }
  };

  // Handle form errors
  const onError = (errors) => {
    console.log("Form validation errors:", errors);

    // Focus on first error field
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
      }
    }
  };

  // Handle application questions input change
  const handleQuestionsChange = (newResponses) => {
    setValue("question_responses", newResponses);
    trigger("question_responses");
  };

  if (isLoadingJob) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button
        variant="outline"
        onClick={() => navigate("/find-jobs")}
        className="mb-6 border-slate-600 text-slate-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <Card className="bg-slate-800/50 border-slate-700 mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            {job?.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">{job?.role_needed}</Badge>
            <span className="text-green-400 font-semibold">${job?.budget}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-200">{job?.description}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Submit Your Application
          </CardTitle>
          <CardDescription className="text-slate-300">
            Tell the creator why you're perfect for this job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Cover Letter *
              </label>
              <Controller
                name="cover_letter"
                control={control}
                rules={validationRules.cover_letter}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Tell the creator why you're perfect for this job. Include relevant experience..."
                    className={`bg-slate-800 border-slate-700 text-white h-32 ${
                      errors.cover_letter ? "border-red-500" : ""
                    }`}
                  />
                )}
              />
              {errors.cover_letter && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.cover_letter.message}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                {watchedValues.cover_letter?.length || 0}/1000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proposed Budget */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Proposed Budget ($) *
                </label>
                <Controller
                  name="proposed_budget"
                  control={control}
                  rules={validationRules.proposed_budget}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Your proposed budget..."
                      className={`bg-slate-800 border-slate-700 text-white ${
                        errors.proposed_budget ? "border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.proposed_budget && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.proposed_budget.message}
                  </p>
                )}
              </div>

              {/* Estimated Delivery */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Estimated Delivery *
                </label>
                <Controller
                  name="estimated_delivery"
                  control={control}
                  rules={
                    watchedValues.estimated_delivery
                      ? validationRules.estimated_delivery
                      : {}
                  }
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className={`bg-slate-800 border-slate-700 text-white ${
                        errors.estimated_delivery ? "border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.estimated_delivery && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.estimated_delivery.message}
                  </p>
                )}
              </div>
            </div>

            {/* Portfolio Links */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Portfolio Links (optional)
              </label>
              <Controller
                name="portfolio_links"
                control={control}
                rules={
                  watchedValues.portfolio_links
                    ? validationRules.portfolio_links
                    : {}
                }
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Enter portfolio links (one per line)..."
                    className={`bg-slate-800 border-slate-700 text-white h-24 ${
                      errors.portfolio_links ? "border-red-500" : ""
                    }`}
                  />
                )}
              />
              {errors.portfolio_links && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.portfolio_links.message}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                Enter one URL per line
              </p>
            </div>

            {/* Relevant Experience */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Relevant Experience (optional)
              </label>
              <Controller
                name="relevant_experience"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Describe your relevant experience for this job..."
                    className="bg-slate-800 border-slate-700 text-white h-24"
                  />
                )}
              />
            </div>

            {/* ✅ FIXED: Custom Questions Section */}
            {job?.application_questions &&
              job.application_questions.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-t border-slate-700 pt-6">
                    Additional Questions
                  </h3>

                  <Controller
                    name="question_responses"
                    control={control}
                    rules={{ validate: validateQuestionResponses }}
                    render={({ field }) => (
                      <ApplicationQuestionsInput
                        questions={job.application_questions}
                        value={field.value || []}
                        onChange={(newResponses) => {
                          field.onChange(newResponses);
                          handleQuestionsChange?.(newResponses);
                        }}
                      />
                    )}
                  />

                  {errors?.question_responses && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.question_responses.message}
                    </p>
                  )}
                </div>
              )}

            {/* Form Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Please fix the following errors:
                </h4>
                <ul className="text-red-300 text-sm space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-slate-700">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Apply Now"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
