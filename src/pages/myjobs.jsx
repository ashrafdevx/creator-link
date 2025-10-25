import React, { useState } from "react";
import { Link } from "react-router-dom";
import PostedJobCard from "@/components/jobs/PostedJobCard";
import { Card, CardContent } from "@/components/ui/card";
import { useMyJobs } from "@/hooks/jobs/useCurrentUserPostedJobs";
import { Briefcase, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // ✅ correct import

const Myjobs = () => {
  // Current User Posted Jobs
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetcMMyJobs,
  } = useMyJobs(page, limit);

  // ✅ placeholder for delete
  const handleDeleteJob = (jobId) => {
    console.log("Delete job:", jobId);
    // Implement delete API call here
  };

  return (
    <div className="space-y-8 py-5">
      {/* Posted Jobs Management */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent>
          <div className="space-y-4">
            {data?.data?.jobs?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.data.jobs?.map((job) => (
                  <div key={job?._id}>
                    <PostedJobCard
                      job={{
                        id: job?._id,
                        title: job?.title,
                        description: job?.description,
                        role_needed: job?.role_needed,
                        niches: job?.niches || [],
                        budget: job?.budget,
                        deadline: job?.deadline,
                        status: job?.status,
                        applicant_count: job?.applicant_count,
                        createdAt: job?.createdAt,
                      }}
                      onEdit={(jobId) => {
                        console.log("Edit job:", jobId);
                        // navigate(`/jobs/edit/${jobId}`)
                      }}
                      onViewApplications={() => {
                        console.log("View applications for:", job?._id);
                        // navigate(`/ViewApplications/${job?._id}`)
                      }}
                      onToggleStatus={(jobId, action) => {
                        console.log("Toggle status for job:", jobId, action);
                        // Implement status toggle functionality
                      }}
                      onDelete={(jobId) => handleDeleteJob(jobId)}
                      onViewDetails={(jobId) => {
                        console.log("View details for:", jobId);
                        // navigate(`/jobs/${jobId}`)
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-500 mb-4">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400 mb-2">No jobs posted yet</p>
                  <p className="text-sm text-slate-500">
                    Start by posting your first job to find talented creators
                  </p>
                </div>
                <Link to="/post-job">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-4">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Myjobs;
