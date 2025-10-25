import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Home from "./Home";

import FindJobs from "./FindJobs";

import PostJob from "./PostJob";

import Profile from "./Profile";

import FindFreelancers from "./FindFreelancers";

import FAQ from "./FAQ";

import Messages from "./Messages";

import JobDetails from "./JobDetails";

import ServiceDetails from "./ServiceDetails";

import JobApplication from "./JobApplication";

import Payment from "./Payment";

import AdminDashboard from "./AdminDashboard";

import ClientDashboard from "./ClientDashboard";

import FreelancerDashboard from "./FreelancerDashboard";

import FreelancerProfile from "./FreelancerProfile";

import Auth from "../components/auth/Auth";

import ResetPasswordPage from "./auth/ResetPasswordPage";

import ViewApplications from "./ViewApplications";

import ClientPublicProfile from "./ClientPublicProfile";

import FreelancerPublicProfile from "./FreelancerPublicProfile";

import ReviewFormPage from "./ReviewFormPage";

import Earnings from "./Earnings";

import Expenses from "./Expenses";

import BrowseGigs from "./gigs/BrowseGigs";

import CreateGig from "./gigs/CreateGig";

import MyGigs from "./gigs/MyGigs";

import GigDetails from "./gigs/GigDetails";

import SavedItems from "./saved/SavedItems";

import Support from "./Support";

import Orders from "./Orders";

import OrderDetail from "./OrderDetail";
import PayoutSettings from "./PayoutSettings";
import PayoutSetupSuccess from "./PayoutSetupSuccess";
import TermsOfService from "./legal/TermsOfService";
import PrivacyPolicy from "./legal/PrivacyPolicy";

import ErrorBoundary from "../components/ErrorBoundary";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Myjobs from "./myjobs.jsx";
import ReviewSystemDemo from "@/components/rating/rating.jsx";
// import StripeConnectOnboarding from "./StripeConnectOnboarding.jsx";

const PAGES = {
  Dashboard: Dashboard,

  Home: Home,

  FindJobs: FindJobs,

  PostJob: PostJob,

  Profile: FreelancerProfile,

  FindFreelancers: FindFreelancers,

  FAQ: FAQ,

  Messages: Messages,

  JobDetails: JobDetails,

  ServiceDetails: ServiceDetails,

  JobApplication: JobApplication,

  Payment: Payment,

  AdminDashboard: AdminDashboard,

  ClientDashboard: ClientDashboard,

  FreelancerDashboard: FreelancerDashboard,

  SuperAdmin: AdminDashboard,

  // FreelancerProfile: FreelancerProfile,

  ViewApplications: ViewApplications,

  ClientPublicProfile: ClientPublicProfile,

  FreelancerPublicProfile: FreelancerPublicProfile,

  BrowseGigs: BrowseGigs,

  CreateGig: CreateGig,

  MyGigs: MyGigs,

  GigDetails: GigDetails,

  SavedItems: SavedItems,

  Support: Support,

  Orders: Orders,

  OrderDetail: OrderDetail,

  TermsOfService: TermsOfService,

  PrivacyPolicy: PrivacyPolicy,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || "Home";
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/find-jobs" element={<FindJobs />} />

        <Route path="/PostJob" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        <Route path="/PostJob/:id" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />

        <Route path="/Profile" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />

        <Route path="/FindFreelancers" element={<FindFreelancers />} />

        <Route path="/FAQ" element={<FAQ />} />

        <Route path="/Messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />


        <Route path="/JobDetails/:id" element={<JobDetails />} />

        <Route path="/ServiceDetails" element={<ServiceDetails />} />

        <Route path="/gigs" element={<BrowseGigs />} />
        <Route path="/gigs/create" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
        <Route path="/my-gigs" element={<ProtectedRoute><MyGigs /></ProtectedRoute>} />
        <Route path="/gigs/:id" element={<GigDetails />} />

        <Route path="/JobApplication/:jobId" element={<ProtectedRoute><JobApplication /></ProtectedRoute>} />

        <Route path="/Payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

        <Route path="/AdminDashboard" element={<ProtectedRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedRoute>} />

        <Route path="/ClientDashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />

        <Route path="/FreelancerDashboard" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />

        <Route path="/super-admin" element={<ProtectedRoute requireRole="super-admin"><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedRoute>} />

        <Route path="/auth" element={<Auth />} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* <Route path="/FreelancerProfile" element={<FreelancerProfile />} /> */}

        <Route path="/ViewApplications/:jobId" element={<ProtectedRoute><ViewApplications /></ProtectedRoute>} />
        <Route path="/myjobs" element={<ProtectedRoute><Myjobs /></ProtectedRoute>} />

        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

        <Route path="/saved" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />

        <Route
          path="/user/:creatorId"
          element={<ClientPublicProfile />}
        />
        <Route
          path="/freelancer/:freelancerId"
          element={<FreelancerPublicProfile />}
        />
        <Route path="/review-form" element={<ProtectedRoute><ReviewFormPage /></ProtectedRoute>} />
        <Route path="/review-form/:orderId" element={<ProtectedRoute><ReviewFormPage /></ProtectedRoute>} />
        {/* <Route path="/rating-ui" element={<ReviewSystemDemo />} /> */}
        <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/support" element={<Support />} />
        <Route
          path="/settings/payouts"
          element={
            <ProtectedRoute requireRole="freelancer">
              <PayoutSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/payouts/success"
          element={
            <ProtectedRoute requireRole="freelancer">
              <PayoutSetupSuccess />
            </ProtectedRoute>
          }
        />
        <Route path="/legal/terms-of-service" element={<TermsOfService />} />
        <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
        {/* <Route
          path="/stripe-connect-onboarding"
          element={<StripeConnectOnboarding />}
        /> */}
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
