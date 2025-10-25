# Crelance - Creator Freelance Platform

## Overview

Crelance is a comprehensive freelance marketplace platform specifically designed for content creators and creative professionals. The platform connects clients with freelancers across various creative niches (YouTube, TikTok, Instagram, etc.) and enables gig-based services, job postings, secure payments, messaging, and more.

**Tech Stack:**
- Frontend: React 18 with Vite
- UI Framework: Radix UI components with Tailwind CSS (shadcn/ui design system)
- State Management: TanStack React Query for server state
- Routing: React Router (implied from structure)
- Real-time: Socket.io for live messaging and notifications
- Payment Processing: Stripe (both standard payments and Stripe Connect for payouts)
- Build Tool: Vite with ESLint configuration
- Deployment: Replit (migrated from Vercel on October 25, 2025)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Uses shadcn/ui component library (New York style variant) with Radix UI primitives
- Path aliases configured for clean imports (@/components, @/hooks, @/lib, @/utils)
- Component organization follows feature-based structure
- Custom hooks for reusable logic across features

**State Management:**
- TanStack React Query for all server state management
- Query keys organized by feature (e.g., ['gigs', filters], ['orders', orderId])
- Optimistic updates and automatic cache invalidation
- Query client configured for global state coordination
- Local component state for UI-only concerns

**Routing & Navigation:**
- SPA with client-side routing
- Development server runs on port 5000 with HMR support
- Configured for Replit environment with host 0.0.0.0 and clientPort 443 for HMR over HTTPS proxy

**Authentication Flow:**
- Custom JWT-based authentication (no third-party auth providers)
- Token storage in localStorage with automatic refresh logic
- Access tokens with 15-minute expiry, refresh tokens for session extension
- Automatic token validation and refresh before API requests
- Auth state managed via useAuth hook with React Query
- Protected routes check authentication status before rendering

**Design System:**
- Tailwind CSS with custom theme extending neutral color palette
- CSS variables for theming (--background, --primary, --card, etc.)
- Consistent border radius using CSS custom properties
- Dark mode support via class-based strategy
- Responsive design with mobile-first approach

### Backend Integration

**API Client Configuration:**
- Axios-based HTTP client with request/response interceptors
- Base URL from environment variable (VITE_API_BASE_URL)
- Automatic JWT token attachment on all authenticated requests
- Request interceptor fetches valid access token (auto-refreshes if expired)
- Response interceptor preserves error structure for validation messages
- Credentials sent with requests for cookie-based fallback

**Authentication Utilities:**
- JWT token management with automatic refresh logic
- Token expiration detection via JWT payload decoding
- Refresh token flow when access token expires
- Centralized token storage and retrieval
- User data cached in localStorage alongside tokens
- Logout clears all tokens and cached user data

**API Services:**
- Feature-based service modules (authService, gigService, orderApi, etc.)
- Consistent error handling and response formatting
- Services use makeAuthenticatedRequest helper for token management
- Toast notifications for user feedback on API operations

### Core Features & Data Models

**User Management:**
- Multi-role system: clients, freelancers, admins
- User profiles with niche specializations (YouTube, TikTok, Instagram, etc.)
- Rating and review system for freelancers
- Public freelancer profiles with portfolio showcase
- Availability status tracking
- Hourly rate and budget preferences

**Gig Marketplace:**
- Freelancers create service offerings (gigs)
- Package-based pricing (basic, standard, premium tiers)
- Image uploads for gig showcase
- Category and niche filtering
- Gig status management (active/inactive)
- Search and filter functionality
- Order total calculation before purchase

**Job Board:**
- Clients post jobs with requirements
- Role-based job filtering
- Budget range specifications
- Job application system
- Active job listings management
- My jobs dashboard for clients

**Order Management:**
- Order creation from gig purchases or job acceptances
- Escrow-based payment holding
- Order statuses: pending, in_progress, delivered, revision_requested, completed
- Delivery submission by freelancers
- Revision request system
- Order completion and review flow
- Order numbering system for tracking

**Messaging System:**
- Real-time messaging via Socket.io
- Conversation list with user associations
- Message threading per conversation
- Unread message count tracking
- Message search functionality
- File attachment support
- Message read receipts
- Message deletion capability

**Payment System:**
- Stripe integration for client payments
- Stripe Connect for freelancer payouts
- Escrow system holds funds until order completion
- Platform fee deduction (typically 3%)
- Transaction history tracking
- Balance management (available, pending, total earned)
- Monthly and daily transaction aggregation
- Payout dashboard for freelancers

**Saved Items:**
- Users can save jobs and gigs for later
- Saved item filtering by type
- Bulk unsave operations
- Saved count and statistics
- Check saved status for items

**Reviews & Ratings:**
- Order-based review system
- 5-star rating scale
- Review eligibility checking
- Review analytics and trends
- Rating aggregation for freelancers
- Public review display on profiles

**Admin Dashboard:**
- User management with filtering
- Dashboard statistics and overview
- Transaction monitoring
- Platform analytics

### File Upload Strategy

**Gig Images:**
- Two-step upload process: get signed upload URL, upload to storage, confirm upload
- Image confirmation stores URL in database
- Delete functionality for gig images
- Upload progress tracking
- Query invalidation after upload/delete for cache consistency

**Message Attachments:**
- Similar signed URL approach for secure file uploads
- Attachment metadata stored with messages

### Real-Time Features

**Socket.io Integration:**
- Connection established with JWT authentication
- Auto-reconnect with exponential backoff
- Connection state tracking (isConnected)
- Socket instance shared across application
- Event listeners for live updates (messages, notifications, etc.)

### Error Handling & UX

**Toast Notifications:**
- Sonner library for user feedback
- Success/error messages on all mutations
- Validation error display from API responses
- Network error handling with retry logic

**Loading States:**
- React Query loading states for async operations
- Skeleton loaders for better UX
- Optimistic updates where appropriate
- Previous data retention during refetch

**Form Validation:**
- React Hook Form with resolvers
- Client-side validation before API calls
- Server-side validation error display
- Zod integration for schema validation (implied)

### Performance Optimizations

**Query Configuration:**
- Stale time settings prevent unnecessary refetches (typically 30s-5min)
- Keep previous data during pagination
- Selective refetch on window focus
- Query cancellation on component unmount
- Retry logic with exponential backoff

**Code Splitting:**
- Vite's automatic code splitting
- Lazy loading for route components (implied)
- Optimized bundle size with tree-shaking

**Development Experience:**
- HMR (Hot Module Replacement) enabled
- ESLint configuration for code quality
- Path aliases for clean imports
- JSX in .js files supported via Vite config

## External Dependencies

**Payment Processing:**
- Stripe API for payment processing
- Stripe Connect for freelancer payouts
- @stripe/stripe-js and @stripe/react-stripe-js for frontend integration
- Webhook handling for payment events (backend)

**Backend API:**
- Custom Node.js/Express backend (implied from API structure)
- RESTful API design
- JWT authentication
- PostgreSQL database (likely, based on relational data structure)
- Socket.io server for real-time features

**UI Component Library:**
- Radix UI primitives (@radix-ui/react-*)
- shadcn/ui component system
- Lucide icons (@radix-ui/react-icons)
- Tailwind CSS for styling

**Third-Party Services:**
- Cloud storage for file uploads (AWS S3 or similar, implied from signed URL pattern)
- Email service for notifications (implied)
- Analytics tracking (placeholder in utils)

**Development & Deployment:**
- Vite build tool and dev server
- Vercel for hosting and deployment
- ESLint for code quality
- PostCSS with Autoprefixer

**Key Libraries:**
- axios: HTTP client
- date-fns: Date formatting and manipulation
- framer-motion: Animations
- react-hook-form: Form management
- zod: Schema validation (implied from @hookform/resolvers)
- embla-carousel-react: Carousel component
- cmdk: Command palette component