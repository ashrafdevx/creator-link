import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  ExternalLink,
  Info
} from 'lucide-react';

const SupportIntegration = () => {
  const handleOpenCrispDashboard = () => {
    window.open('https://app.crisp.chat/', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Support Integration</h2>
        <p className="text-gray-600">Manage customer support through Crisp Chat</p>
      </div>

      {/* Crisp Dashboard Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Crisp Chat Dashboard
          </CardTitle>
          <CardDescription>
            Access your Crisp dashboard to view and manage all customer support conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Crisp Chat Integration
                  </p>
                  <p className="text-sm text-blue-700">
                    The Crisp chat widget is now available on the /support page for all logged-in users.
                    Click the button below to access your Crisp dashboard and manage all support conversations.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleOpenCrispDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Open Crisp Dashboard
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

    
    </div>
  );
};

export default SupportIntegration;