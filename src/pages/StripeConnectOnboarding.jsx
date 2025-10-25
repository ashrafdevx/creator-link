// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useCreateConnectAccountLink } from "@/hooks/usePaymentData";

// export default function StripeConnectOnboarding() {
//   const navigate = useNavigate();
//   const { mutateAsync, isPending, isError, error } =
//     useCreateConnectAccountLink();

//   useEffect(() => {
//     (async () => {
//       const origin = window.location.origin; // works for local + prod
//       try
//         const url = await mutateAsync({
//           refresh_url: `${origin}/settings/payouts`,
//           return_url: `${origin}/settings/payouts/success`,
//         });
//         window.location.href = url; // hard redirect to Stripe
//       } catch {}
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="mx-auto max-w-lg p-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Connecting to Stripe…</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {isPending && <p>Creating your onboarding session. Please wait…</p>}
//           {isError && (
//             <>
//               <p className="text-red-600">
//                 Failed: {error?.message || "Unknown error"}
//               </p>
//               <Button
//                 onClick={() => navigate(-1)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Go Back
//               </Button>
//             </>
//           )}
//           {!isPending && !isError && (
//             <p>If you weren’t redirected, you can close this tab.</p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
