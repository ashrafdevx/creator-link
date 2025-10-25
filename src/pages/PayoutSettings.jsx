import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import {
  usePayoutSettings,
  useCreateConnectAccountLink,
  useCreateConnectDashboardLink,
  usePaymentMethods,
} from "@/hooks/usePaymentData";
import { useAuth } from "@/hooks/useAuth";

const STATUS_ICONS = {
  connected: <CheckCircle className="h-5 w-5 text-green-400" />,
  pending: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
  not_connected: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
};

export default function PayoutSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role ?? user?.user?.role ?? null;

  React.useEffect(() => {
    if (role?.toLowerCase() !== "freelancer") {
      navigate("/earnings");
    }
  }, [role, navigate]);

  const { data: payoutSettings, isLoading } = usePayoutSettings();
  const { data: paymentMethods } = usePaymentMethods();
  const {
    mutateAsync: createOnboardingLink,
    isPending: isCreatingOnboardingLink,
  } = useCreateConnectAccountLink();
  const {
    mutateAsync: createDashboardLink,
    isPending: isCreatingDashboardLink,
  } = useCreateConnectDashboardLink();

  const statusSummary = payoutSettings?.status_summary;
  const accountStatus = payoutSettings?.account_status;
  const requirementsDue = Array.isArray(accountStatus?.requirements?.currently_due)
    ? accountStatus?.requirements?.currently_due
    : [];
  const hasOutstandingRequirements = requirementsDue.length > 0;
  const isActionPending = isCreatingOnboardingLink || isCreatingDashboardLink;
  const actionLabel =
    statusSummary?.action === "dashboard"
      ? "Open Stripe Dashboard"
      : statusSummary?.action === "continue"
      ? "Continue Stripe Setup"
      : "Set Up Payments";

  const handlePrimaryAction = async () => {
    const origin = window.location.origin;

    if (statusSummary?.action === "dashboard") {
      const data = await createDashboardLink({ return_url: `${origin}/settings/payouts` });
      const target =
        data?.dashboard_url ??
        data?.url ??
        data;
      if (target) {
        window.location.href = target;
      }
      return;
    }

    const { url } = await createOnboardingLink({
      refresh_url: `${origin}/settings/payouts`,
      return_url: `${origin}/settings/payouts/success`,
    });
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payout Settings</h1>
            <p className="text-slate-400">
              Manage your Stripe Connect payouts and payment configuration.
            </p>
          </div>
          <Button variant="ghost" className="text-slate-300" onClick={() => navigate("/earnings")}>
            Back to Earnings
          </Button>
        </div>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {STATUS_ICONS[statusSummary?.code ?? "not_connected"] ?? <AlertTriangle className="h-5 w-5" />}
              Stripe Connect Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <Badge
                  className={`text-xs ${
                    statusSummary?.code === "connected"
                      ? "bg-green-900/30 text-green-300 border-green-700/50"
                      : "bg-yellow-900/30 text-yellow-300 border-yellow-700/50"
                  }`}
                >
                  {statusSummary?.label ?? "Setup required"}
                </Badge>
                <p className="text-sm text-slate-300">
                  {statusSummary?.description ?? "Connect your Stripe account to receive payouts."}
                </p>

                {hasOutstandingRequirements && (
                  <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/10 p-3 text-sm text-yellow-200">
                    <p className="font-semibold">Stripe requires additional information:</p>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      {requirementsDue.map((item) => (
                        <li key={item}>{item.replace(/_/g, " ")}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Charges enabled</span>
                    <span className="text-white">
                      {accountStatus?.charges_enabled ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payouts enabled</span>
                    <span className="text-white">
                      {accountStatus?.payouts_enabled ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Details submitted</span>
                    <span className="text-white">
                      {accountStatus?.details_submitted ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {statusSummary?.action && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handlePrimaryAction}
                    disabled={isActionPending}
                  >
                    {isActionPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span className={isActionPending ? "ml-2" : undefined}>{actionLabel}</span>
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Saved Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods?.data?.payment_methods?.length ? (
              <ul className="space-y-3 text-sm text-slate-300">
                {paymentMethods.data.payment_methods.map((method) => (
                  <li key={method._id} className="flex justify-between">
                    <span>{method.display_name}</span>
                    {method.is_default && <Badge>Default</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                You haven&apos;t added any payment methods yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
