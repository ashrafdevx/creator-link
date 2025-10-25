import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 text-slate-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="h-6 w-6 text-blue-500"
              >
                <rect width="256" height="256" fill="none" />
                <path
                  d="M128,24a95.8,95.8,0,0,0-67.9,28.1,95.9,95.9,0,0,0,0,135.8A95.8,95.8,0,0,0,128,232a95.3,95.3,0,0,0,48.4-13.3,104,104,0,0,0-23.7-22.9,71.8,71.8,0,0,1-49.4,0,104,104,0,0,0-22.9,23.7A72,72,0,1,1,128,48a71.3,71.3,0,0,1,41.2,12.7,40,40,0,1,0,10.6,10.6A72,72,0,0,1,128,48Z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-bold text-white">Crelance</span>
            </div>
            <p className="text-sm text-slate-400">
              The premier marketplace connecting content creators with clients. Free job posting, secure escrow, and fair pricing.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Platform</h3>
            <div className="space-y-2 text-sm">
              <Link to="/gigs" className="block hover:text-white transition-colors">
                Browse Services
              </Link>
              <Link to="/find-jobs" className="block hover:text-white transition-colors">
                Find Jobs
              </Link>
              <Link to={createPageUrl("FindFreelancers")} className="block hover:text-white transition-colors">
                Find Specialists
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Resources</h3>
            <div className="space-y-2 text-sm">
              <Link to={createPageUrl("FAQ")} className="block hover:text-white transition-colors">
                Help Center
              </Link>
              <Link to="/support" className="block hover:text-white transition-colors">
                Support
              </Link>
              <Link to="/legal/terms-of-service" className="block hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/legal/privacy-policy" className="block hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Support</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4" />
                support@crelance.io
              </div>
              <Link
                to="/support"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Live Chat Support
              </Link>
              <div className="text-slate-400">
                Available 24/7
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-slate-400">
            © 2025 Crelance. All rights reserved.
          </div>
          <div className="text-sm text-slate-400 mt-2 md:mt-0">
            Built for creators, by creators
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
