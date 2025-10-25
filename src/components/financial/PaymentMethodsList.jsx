import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Building2,
  Plus,
  Trash2,
  Star,
  Check,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const PaymentMethodsList = ({
  paymentMethods = [],
  isLoading = false,
  onRemove,
  onSetDefault,
  onAdd,
  showAddButton = true,
  title = null,
}) => {
  const [removingId, setRemovingId] = useState(null);
  console.log("paymentMethods", paymentMethods);
  const getCardBrandIcon = (brand) => {
    const brandIcons = {
      visa: "💳",
      mastercard: "💳",
      amex: "💳",
      discover: "💳",
      diners: "💳",
      jcb: "💳",
      unionpay: "💳",
    };
    return brandIcons[brand?.toLowerCase()] || "💳";
  };

  const getBankIcon = () => "🏦";

  const formatCardNumber = (last4, brand) => {
    return `•••• •••• •••• ${last4}`;
  };

  const formatExpiry = (month, year) => {
    return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
  };

  const handleRemove = async (paymentMethodId) => {
    alert(paymentMethodId);
    // setRemovingId(paymentMethodId);
    try {
      await onRemove?.(paymentMethodId);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-slate-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {title || "Payment Methods"}
          </CardTitle>
          {showAddButton && (
            <Button
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method 
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!Array.isArray(paymentMethods) || paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No payment methods added</p>
            <p className="text-slate-500 text-sm mb-4">
              Add a payment method to start making payments securely.
            </p>
            {showAddButton && (
              <Button
                onClick={onAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Payment Method
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(Array.isArray(paymentMethods) ? paymentMethods : []).map(
              (method) => (
                <div
                  key={method.id}
                  className={`relative p-4 rounded-lg border transition-colors ${
                    method.is_default
                      ? "bg-blue-900/20 border-blue-600/50"
                      : "bg-slate-700/30 border-slate-600"
                  }`}
                >
                  {/* Default Badge */}
                  {method.is_default && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-600 text-white border-blue-500">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Default
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Payment Method Icon */}
                    <div className="flex-shrink-0">
                      {method.type === "card" ? (
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-lg">
                          {getCardBrandIcon(method.card_details?.brand)}
                        </div>
                      ) : (
                        <div className="w-12 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded flex items-center justify-center text-white text-lg">
                          {getBankIcon()}
                        </div>
                      )}
                    </div>

                    {/* Payment Method Details */}
                    <div className="flex-1 min-w-0">
                      {method.type === "card" ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium">
                              {method.card_details?.brand?.toUpperCase()} ending
                              in {method.card_details?.last4}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-400"
                            >
                              {method.card_details?.funding}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>
                              Expires{" "}
                              {formatExpiry(
                                method.card_details?.exp_month,
                                method.card_details?.exp_year
                              )}
                            </span>
                            {method.metadata?.nickname && (
                              <span>• {method.metadata.nickname}</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium">
                              {method.bank_details?.bank_name} ••••{" "}
                              {method.bank_details?.last4}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-400"
                            >
                              {method.bank_details?.account_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>Bank Account</span>
                            {method.metadata?.nickname && (
                              <span>• {method.metadata.nickname}</span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Last Used */}
                      {method.metadata?.last_used_at && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          Last used{" "}
                          {method.metadata?.last_used_at &&
                          !isNaN(new Date(method.metadata.last_used_at))
                            ? format(
                                new Date(method.metadata.last_used_at),
                                "MMM d, yyyy"
                              )
                            : "Unknown"}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSetDefault?.(method.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Set Default (PUT
                          /api/payment-settings/methods/:id/default)
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              removingId === method.id || method.is_default
                            }
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Remove Payment Method (DELETE
                              /api/payment-settings/methods/:id)
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you sure you want to remove this payment
                              method? This action cannot be undone.
                              {method.is_default && (
                                <span className="block mt-2 text-yellow-400">
                                  You cannot remove your default payment method.
                                  Please set another method as default first.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(method.id)}
                              disabled={method.is_default}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="text-xs text-blue-300">
            <strong>🔒 Secure Payment Processing:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>All payment data is encrypted and processed by Stripe</li>
              <li>We never store your full card or bank account numbers</li>
              <li>Transactions are protected by bank-level security</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsList;
