import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, Users, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const RoleSelection = ({ isOpen, onComplete, currentRole = null }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole || 'freelancer');
  const [error, setError] = useState(null);
  const { user, updateRole, isUpdatingRole } = useAuth();


  // Update selected role when currentRole changes
  useEffect(() => {
    if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [currentRole]);

  const roles = [
    {
      id: 'freelancer',
      title: 'Freelancer / Creator',
      description: 'I want to offer my services and find projects to work on',
      icon: Briefcase,
      features: [
        'Create and showcase your portfolio',
        'Apply to job postings',
        'Offer services to clients',
        'Set your own rates',
        'Build your reputation'
      ],
      color: 'bg-blue-500'
    },
    {
      id: 'client',
      title: 'Client',
      description: 'I want to hire talent and post projects',
      icon: Users,
      features: [
        'Post job opportunities',
        'Browse freelancer profiles',
        'Manage project workflows',
        'Secure payment processing',
        'Rate and review work'
      ],
      color: 'bg-green-500'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    try {
      setError(null);
      await updateRole({ role: selectedRole });
      onComplete?.();
    } catch (error) {
      console.error('Failed to update role:', error);
      setError('Failed to update role. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Choose Your Role</DialogTitle>
          <DialogDescription className="text-slate-400">
            Select how you'd like to use Crelance. You can change this later in your profile settings.
          </DialogDescription>
        </DialogHeader>
        
        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500/50 bg-red-950/50">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 py-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all border-2 ${
                  isSelected 
                    ? 'border-blue-500 bg-slate-800/50' 
                    : 'border-slate-700 bg-slate-800/20 hover:bg-slate-800/40'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${role.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{role.title}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {role.description}
                        </CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="h-1.5 w-1.5 bg-slate-400 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isUpdatingRole}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdatingRole ? 'Updating role...' : 'Update Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelection;