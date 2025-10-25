import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PayoutSetupSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <Card className="max-w-lg bg-slate-800/70 border-slate-700 text-center">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-400" />
            Stripe Setup Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-300">
          <p>
            Thanks for completing the Stripe onboarding steps. It can take a few minutes for Stripe
            to verify your information. Once payouts are enabled you&apos;ll see the status update in
            your payout settings.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/settings/payouts")}
            >
              Review Payout Settings
            </Button>
            <Button variant="outline" className="text-slate-300" onClick={() => navigate("/earnings")}>
              Back to Earnings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
