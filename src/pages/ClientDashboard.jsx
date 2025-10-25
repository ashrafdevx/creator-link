import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Search, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ClientDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || user.role !== 'client') {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              You need client privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Current role: <Badge variant="outline">{user?.role || 'No role'}</Badge>
            </p>
            <p className="text-sm text-red-600">
              This is a protected route that demonstrates RBAC (Role-Based Access Control) working correctly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Welcome, {user.firstName} {user.lastName}! Post jobs and hire talented creators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Post Job
            </CardTitle>
            <CardDescription>
              Create a new job posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Post New Job
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Freelancers
            </CardTitle>
            <CardDescription>
              Browse available creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Browse Creators
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              My Jobs
            </CardTitle>
            <CardDescription>
              Manage your job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              View Jobs
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments
            </CardTitle>
            <CardDescription>
              Manage escrow & billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Payments
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700">RBAC Testing Status</CardTitle>
          <CardDescription className="text-green-600">
            Role-based access control is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              ✅ Current user role: <Badge variant="secondary">{user.role}</Badge>
            </p>
            <p className="text-sm">
              ✅ Access granted to client protected route
            </p>
            <p className="text-sm">
              ✅ Page content visible only to authorized users
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}