import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ReviewForm from "@/components/reviews/ReviewForm";

export default function ReviewFormPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();

  const freelancerName = searchParams.get("freelancer_name");
  const projectTitle = searchParams.get("project_title");

  return (
    <ReviewForm
      orderId={orderId}
      freelancerName={freelancerName}
      projectTitle={projectTitle}
    />
  );
}
