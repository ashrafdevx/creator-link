import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Users, 
  Briefcase, 
  DollarSign, 
  Shield, 
  Clock,
  Star,
  MessageCircle,
  CreditCard
} from 'lucide-react';

const FAQItem = ({ icon, question, answer }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-slate-100">
        {icon}
        {question}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-slate-200 leading-relaxed">{answer}</p>
    </CardContent>
  </Card>
);

export default function FAQ() {
  const creatorFAQs = [
    {
      icon: <Briefcase className="h-5 w-5 text-blue-400" />,
      question: "How do I post a job?",
      answer: "Click 'Post a Job' in the navigation, fill out the job details including the role needed, your content niche, budget, and deadline. Your job will be visible to all specialists immediately."
    },
    {
      icon: <Users className="h-5 w-5 text-purple-400" />,
      question: "How do I find the right specialist?",
      answer: "Use our 'Browse Services' page to find specialists by role and niche. You can view their portfolios, ratings, and past work. You can also wait for specialists to apply to your posted jobs."
    },
    {
      icon: <DollarSign className="h-5 w-5 text-green-400" />,
      question: "How does payment work?",
      answer: "Payment is processed securely through Stripe when you hire a specialist. We add a 10% platform fee to cover matching, support and maintenance. Specialists receive payment directly to their bank account."
    },
    {
      icon: <Shield className="h-5 w-5 text-yellow-400" />,
      question: "How do I know if a specialist is reliable?",
      answer: "Check their profile for completed jobs, average rating, response time, and portfolio. Look for specialists with high activity scores and good reviews from other creators."
    }
  ];

  const specialistFAQs = [
    {
      icon: <Star className="h-5 w-5 text-yellow-400" />,
      question: "How do I create a compelling profile?",
      answer: "Add a professional headline, detailed bio, showcase your best work in your portfolio, specify your roles and niches clearly, and keep your profile updated with recent projects."
    },
    {
      icon: <Briefcase className="h-5 w-5 text-blue-400" />,
      question: "How do I get paid?",
      answer: "Complete our Stripe Connect onboarding in your profile to set up direct bank transfers. You'll receive payments directly to your bank account when jobs are completed, minus our 10% platform fee."
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-green-400" />,
      question: "Can I send custom offers?",
      answer: "Yes! When messaging with creators, you can send custom offers with your proposed price, timeline, and project details. They can accept, decline, or negotiate directly in chat."
    },
    {
      icon: <Clock className="h-5 w-5 text-purple-400" />,
      question: "How can I improve my ranking?",
      answer: "Complete jobs successfully, maintain quick response times, ask clients for reviews, stay active on the platform, and keep your portfolio updated with your best recent work."
    }
  ];

  const generalFAQs = [
    {
      icon: <HelpCircle className="h-5 w-5 text-indigo-400" />,
      question: "What's the difference between Long Form and Short Form editors?",
      answer: "Long Form Editors specialize in traditional videos (5+ minutes), while Short Form Editors focus on short-form content like Reels, Shorts, and TikTok videos (under 60 seconds)."
    },
    {
      icon: <Users className="h-5 w-5 text-pink-400" />,
      question: "How does the leaderboard work?",
      answer: "Our leaderboard ranks specialists based on completed jobs and average ratings. Filter by role and niche to see top performers in your area of interest."
    },
    {
      icon: <CreditCard className="h-5 w-5 text-green-400" />,
      question: "What are your fees?",
      answer: "We charge a 10% platform fee on each completed project to keep the platform running and provide support. This fee is added to the service price at checkout and is clearly displayed."
    },
    {
      icon: <Clock className="h-5 w-5 text-teal-400" />,
      question: "How quickly can I find help for my content?",
      answer: "Many specialists respond to messages within hours. You can browse available services immediately, and active specialists typically respond within 24 hours."
    },
    {
      icon: <Users className="h-5 w-5 text-blue-400" />,
      question: "Can I be both a creator and a specialist?",
      answer: "Absolutely! Our platform is flexible - you can post jobs when you need help with your content, and offer your own services to other creators. There are no restrictions on being both."
    },
    {
      icon: <Shield className="h-5 w-5 text-orange-400" />,
      question: "What content platforms do you support?",
      answer: "Crelance works with creators from all platforms - whether you create content for social media, streaming platforms, or any other digital medium. Our specialists adapt to your platform's specific needs."
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
          How Crelance Works
        </h1>
        <p className="text-xl text-slate-200 max-w-2xl mx-auto">
          Your questions answered. Get the most out of the content creator marketplace.
        </p>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Create Your Account</h3>
            <p className="text-slate-200">Sign up with Google and choose your role: Creator or Specialist</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Connect & Collaborate</h3>
            <p className="text-slate-200">Creators post jobs, specialists apply, and projects get matched through our platform</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Grow Together</h3>
            <p className="text-slate-200">Complete projects, leave reviews, and build long-term partnerships</p>
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-blue-600">For Creators</Badge>
            <h2 className="text-2xl font-bold text-white">Creator Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creatorFAQs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-purple-600">For Specialists</Badge>
            <h2 className="text-2xl font-bold text-white">Specialist Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialistFAQs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-indigo-600">General</Badge>
            <h2 className="text-2xl font-bold text-white">General Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalFAQs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </section>
      </div>

      {/* Contact Section */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-slate-700 mt-16">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Still have questions?</CardTitle>
          <CardDescription className="text-slate-200">
            We're here to help you succeed on Crelance
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-slate-200 mb-4">
            Can't find what you're looking for? Reach out to our support team.
          </p>
          <Badge className="bg-slate-700 text-slate-200 px-4 py-2">
            support@crelance.io
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}