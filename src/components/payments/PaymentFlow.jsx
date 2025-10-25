import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield } from 'lucide-react';

// Use environment variable or fallback - this will be set by your build process
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const CheckoutForm = ({ service, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);

    React.useEffect(() => {
        const initializePayment = async () => {
            try {
                const { data } = await createPaymentIntent({
                    amount: service.starting_price,
                    serviceId: service.id,
                    freelancerId: service.freelancer.user.id,
                    description: service.title
                });
                setPaymentDetails(data);
            } catch (error) {
                onError(error.message);
            }
        };
        initializePayment();
    }, [service]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !paymentDetails) {
            return;
        }

        setIsProcessing(true);

        const card = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            paymentDetails.client_secret,
            {
                payment_method: {
                    card: card,
                }
            }
        );

        if (error) {
            onError(error.message);
        } else if (paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent);
        }

        setIsProcessing(false);
    };

    if (!paymentDetails) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                    <span className="text-slate-300">Service Price:</span>
                    <span className="text-white">${(paymentDetails.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-300">Platform Fee (10%):</span>
                    <span className="text-white">${(paymentDetails.platform_fee / 100).toFixed(2)}</span>
                </div>
                <hr className="border-slate-600" />
                <div className="flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400">${(paymentDetails.total_amount / 100).toFixed(2)}</span>
                </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#ffffff',
                                '::placeholder': {
                                    color: '#94a3b8',
                                },
                            },
                        },
                    }}
                />
            </div>

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ${(paymentDetails.total_amount / 100).toFixed(2)}
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center text-xs text-slate-400">
                <Shield className="w-3 h-3 mr-1" />
                Your payment information is secure and encrypted
            </div>
        </form>
    );
};

export default function PaymentFlow({ service, isOpen, onClose, onSuccess }) {
    if (!isOpen) return null;

    const handleSuccess = (paymentIntent) => {
        onSuccess(paymentIntent);
        onClose();
    };

    const handleError = (error) => {
        alert(`Payment failed: ${error}`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="text-white">Complete Your Purchase</CardTitle>
                    <CardDescription>
                        You're hiring {service.freelancer.user.full_name} for "{service.title}"
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Elements stripe={stripePromise}>
                        <CheckoutForm 
                            service={service} 
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    </Elements>
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full mt-4 border-slate-600 text-slate-200"
                    >
                        Cancel
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}