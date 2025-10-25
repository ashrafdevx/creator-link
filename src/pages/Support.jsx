import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { submitContactForm } from '@/api/contactService';
import { toast } from 'sonner';
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Send,
  HelpCircle,
  Clock,
  CheckCircle
} from 'lucide-react';

const Support = () => {
  const { user, isSignedIn } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load Crisp chat widget only for logged-in users
  useEffect(() => {
    if (isSignedIn) {
      // Initialize Crisp
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = "7b243eca-abe5-422a-9118-10a1249a26b4";

      // Create and inject Crisp script
      const script = document.createElement("script");
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.getElementsByTagName("head")[0].appendChild(script);

      // Cleanup function to remove Crisp when component unmounts
      return () => {
        if (window.$crisp) {
          window.$crisp.push(['do', 'chat:hide']);
        }
        const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [isSignedIn]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContactForm(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully! We will respond within 24 hours.');
    } catch (err) {
      console.error('Failed to submit contact form:', err);

      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach(error => {
          toast.error(error.message);
        });
      } else {
        toast.error(
          err.response?.data?.message ||
          'Failed to submit your message. Please try again later.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Choose the best way to reach our support team or get instant assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Chat Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Live Chat Support
              </CardTitle>
              <CardDescription>
                Get instant help from our support team through live chat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Available 24/7</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Our chat support is available around the clock for urgent issues and general inquiries.
                  </p>
                </div>

                {isSignedIn ? (
                  <div className="space-y-3">
                    <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      ✓ You're logged in! Click below to start a chat with our support team.
                    </p>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        if (window.$crisp) {
                          window.$crisp.push(['do', 'chat:open']);
                        } else {
                          alert('Chat support is currently unavailable. Please try refreshing the page or use the contact form below.');
                        }
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Live Chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      Please sign in to access live chat support with full account context.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Sign In for Live Chat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Contact Form
              </CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">
                    We've received your message and will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your issue or question in detail..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <HelpCircle className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Have Questions?
              </h3>
              <p className="text-gray-600 mb-6">
                Visit our comprehensive FAQ page for detailed answers to all your questions about Crelance.
              </p>
              <a
                href="http://localhost:5174/faq"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                Visit FAQ Page
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Email Support</h3>
              <p className="text-gray-600 text-sm">support@crelance.io</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Response Time</h3>
              <p className="text-gray-600 text-sm">Within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
              <p className="text-gray-600 text-sm">Available 24/7</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;