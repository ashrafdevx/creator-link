// components/payments/PaymentsPanel.jsx
import { useNavigate } from "react-router-dom";
// import { usePayoutSettings } from "@/hooks/payments/usePayoutSettings";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePayoutSettings } from "@/hooks/usePaymentData";

const fmtExpiry = (m, y) =>
  m && y ? `${String(m).padStart(2, "0")}/${String(y).slice(-2)}` : "—";
const brandLabel = (brand) => (brand ? brand.toUpperCase() : "CARD");

function PaymentMethodItem({ pm }) {
  const c = pm?.card_details || {};
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium">
            {pm?.display_name || pm?.metadata?.nickname || "Payment Method"}
          </div>
          <div className="text-sm text-muted-foreground">
            {brandLabel(c.brand)} •••• {c.last4} · Expires{" "}
            {fmtExpiry(c.exp_month, c.exp_year)}
          </div>
          {pm?.metadata?.last_used_at && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Last used: {new Date(pm?.metadata.last_used_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {pm?.is_default && <Badge>Default</Badge>}
        {pm?.is_expired && <Badge variant="destructive">Expired</Badge>}
      </div>
    </div>
  );
}

export default function PaymentsPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = usePayoutSettings();

  const methods = data?.payment_methods || [];
  const total = data?.total_count ?? methods.length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Payments & Payouts</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            title="Refresh"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["payout-settings"] })
            }
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/stripe-connect-onboarding")}
          >
            Setup Payments
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading payment methods…
          </div>
        )}
        {isError && (
          <div className="text-sm text-red-600">
            {error?.message || "Failed to load payout settings."}
          </div>
        )}

        {!isLoading && !methods.length && (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            No payment methods on file yet. Click{" "}
            <span className="font-medium">Setup Payments</span> to start
            onboarding with Stripe.
          </div>
        )}

        {!!methods?.length && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {total} method{total === 1 ? "" : "s"} found
            </div>
            {methods.map((pm) => (
              <PaymentMethodItem key={pm.id || pm._id} pm={pm} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
