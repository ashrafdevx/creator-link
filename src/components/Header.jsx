import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  User as UserIcon,
  Menu,
  MessageSquare,
  X,
  PlusCircle,
  DollarSign,
  CreditCard,
  Bookmark,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DesktopNavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm font-medium px-4 py-2 transition-colors hover:text-white ${
        isActive ? "text-white" : "text-slate-400"
      }`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block text-base p-3 rounded-md transition-colors ${
        isActive
          ? "bg-slate-700 text-white"
          : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Mock auth state - replace with your actual auth hook
  const isSignedIn = false;
  const user = null;
  const role = null;
  const isClient = role === "client";
  const isFreelancer = role === "freelancer";

  const getInitials = () => {
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.fullName) {
      return user.fullName[0].toUpperCase();
    }
    return "U";
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    // Add your logout logic
    navigate("/");
  };

  const LogoutButton = ({ children }) => (
    <div onClick={handleLogout} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );

  const visitorLinks = [
    { label: "Find Jobs", to: "/find-jobs" },
    { label: "Browse Gigs", to: "/gigs" },
    { label: "Find Specialists", to: "/find-freelancers" },
    { label: "Leaderboard", to: "/leaderboard" },
  ];

  const clientLinks = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Post a Job", to: "/post-job", cta: true },
    { label: "Find Specialists", to: "/find-freelancers" },
    { label: "Browse Services", to: "/gigs" },
    { label: "Orders", to: "/orders" },
    { label: "My Jobs", to: "/my-jobs" },
  ];

  const freelancerLinks = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Browse Jobs", to: "/find-jobs" },
    { label: "Browse Gigs", to: "/gigs" },
    { label: "Orders", to: "/orders" },
    { label: "My Gigs", to: "/my-gigs" },
  ];

  const navLinks = !isSignedIn
    ? visitorLinks
    : isClient
    ? clientLinks
    : isFreelancer
    ? freelancerLinks
    : [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Orders", to: "/orders" },
      ];

  const dropdownItems = [
    ...(role === "super-admin"
      ? [
          {
            label: "Admin Dashboard",
            to: "/super-admin",
            icon: Shield,
          },
        ]
      : []),
    ...(isClient
      ? [
          {
            label: "Profile",
            to: "/profile",
            icon: UserIcon,
          },
          {
            label: "Messages",
            to: "/messages",
            icon: MessageSquare,
          },
          {
            label: "Expenses",
            to: "/expenses",
            icon: CreditCard,
          },
          {
            label: "Saved",
            to: "/saved",
            icon: Bookmark,
          },
        ]
      : isFreelancer
      ? [
          {
            label: "Profile",
            to: "/profile",
            icon: UserIcon,
          },
          {
            label: "Messages",
            to: "/messages",
            icon: MessageSquare,
          },
          {
            label: "Saved",
            to: "/saved",
            icon: Bookmark,
          },
          {
            label: "Earnings",
            to: "/earnings",
            icon: DollarSign,
          },
          {
            label: "Payout Settings",
            to: "/settings/payouts",
            icon: PlusCircle,
          },
        ]
      : [
          {
            label: "Profile",
            to: "/profile",
            icon: UserIcon,
          },
          {
            label: "Messages",
            to: "/messages",
            icon: MessageSquare,
          },
          {
            label: "Saved",
            to: "/saved",
            icon: Bookmark,
          },
        ]),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="h-8 w-8 text-blue-500"
            >
              <rect width="256" height="256" fill="none" />
              <path
                d="M128,24a95.8,95.8,0,0,0-67.9,28.1,95.9,95.9,0,0,0,0,135.8A95.8,95.8,0,0,0,128,232a95.3,95.3,0,0,0,48.4-13.3,104,104,0,0,0-23.7-22.9,71.8,71.8,0,0,1-49.4,0,104,104,0,0,0-22.9,23.7A72,72,0,1,1,128,48a71.3,71.3,0,0,1,41.2,12.7,40,40,0,1,0,10.6,10.6A72,72,0,0,1,128,48Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xl font-semibold text-white">
              CreatorLink
            </span>
          </Link>

          {/* Center: Navigation Pill */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/40 backdrop-blur-xl px-2 py-2">
              {navLinks.map(({ label, to, cta }) =>
                cta ? null : (
                  <DesktopNavLink key={label} to={to}>
                    {label}
                  </DesktopNavLink>
                )
              )}
            </nav>
          </div>

          {/* Right: Auth Button */}
          <div className="hidden md:flex items-center gap-3 z-10">
            {isSignedIn ? (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={
                              user?.avatar ||
                              user?.user?.avatar ||
                              user?.imageUrl ||
                              user?.picture
                            }
                            alt={user?.fullName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-slate-800 border-slate-700 text-slate-200"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.fullName}
                          </p>
                          <p className="text-xs leading-none text-slate-400">
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      {dropdownItems.map(({ label, to, icon: Icon }) => (
                        <DropdownMenuItem
                          key={label}
                          asChild
                          className="cursor-pointer focus:bg-slate-700 focus:text-white"
                        >
                          <Link to={to}>
                            <Icon className="mr-2 h-4 w-4" />
                            {label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <LogoutButton>
                        <DropdownMenuItem className="cursor-pointer focus:bg-red-900/50 focus:text-white">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </LogoutButton>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <LogoutButton>
                    <Button
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-800"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </LogoutButton>
                )}
              </>
            ) : (
              <Link to="/auth">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2 text-sm font-medium">
                  Login / Signup
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: menu button */}
          <div className="md:hidden ml-auto z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 z-40 md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              {navLinks.map(({ label, to, cta }) =>
                cta ? (
                  <Link
                    key={label}
                    to={to}
                    onClick={closeMobileMenu}
                    className="block"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      {label}
                    </Button>
                  </Link>
                ) : (
                  <MobileNavLink key={label} to={to} onClick={closeMobileMenu}>
                    {label}
                  </MobileNavLink>
                )
              )}

              {isSignedIn && dropdownItems.length > 0 && (
                <div className="border-t border-slate-700 pt-3 mt-3 space-y-2">
                  {dropdownItems.map(({ label, to, icon: Icon }) => (
                    <MobileNavLink
                      key={label}
                      to={to}
                      onClick={closeMobileMenu}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                    </MobileNavLink>
                  ))}
                </div>
              )}

              {isSignedIn && (
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <LogoutButton>
                    <Button
                      onClick={closeMobileMenu}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </LogoutButton>
                </div>
              )}

              {!isSignedIn && (
                <Link to="/auth" onClick={closeMobileMenu}>
                  <Button
                    className="h-12 px-10 rounded-full text-white font-semibold
  [background:linear-gradient(270deg,#1A3BFF_0%,#3B5BFF_50%,#1A3BFF_100%)]
  shadow-[0_4px_20px_rgba(30,60,255,0.35)] relative overflow-hidden
  before:content-[''] before:absolute before:inset-0 before:rounded-full
  before:[background:radial-gradient(circle_at_center,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_70%)]
  before:opacity-80 before:mix-blend-overlay"
                  >
                    Login / Signup
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
