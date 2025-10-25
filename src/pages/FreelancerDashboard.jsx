import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Search, Plus, Star, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function FreelancerDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || user.role !== 'freelancer') {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              You need freelancer privileges to access this page.
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
          <User className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Welcome, {user.firstName} {user.lastName}! Find jobs and showcase your skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Jobs
            </CardTitle>
            <CardDescription>
              Browse available opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Browse Jobs
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Service
            </CardTitle>
            <CardDescription>
              Showcase your offerings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Create Service
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              My Applications
            </CardTitle>
            <CardDescription>
              Track your proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              View Applications
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Feature placeholder - Sprint 2+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Portfolio
            </CardTitle>
            <CardDescription>
              Manage your work samples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Edit Portfolio
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
              ✅ Access granted to freelancer protected route
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