import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PostedJobCard from './PostedJobCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock API call - replace with your actual API integration
const fetchMyJobs = async (status = '') => {
  // This would be your actual API call to /api/jobs/my-jobs
  // const response = await fetch(`/api/jobs/my-jobs?status=${status}`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return response.json();
  
  // Mock data for demonstration
  return {
    success: true,
    data: {
      jobs: [
        {
          id: '1',
          title: 'YouTube Video Editor Needed for Gaming Channel',
          description: 'Looking for an experienced editor to create engaging gaming content. Must be familiar with fast-paced editing, sound effects, and creating compelling thumbnails.',
          role_needed: 'Long Form Editor',
          niches: ['Gaming', 'Entertainment'],
          budget: 500,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'active',
          applicant_count: 12,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          id: '2',
          title: 'Instagram Reel Creator for Beauty Brand',
          description: 'Need creative short-form content creator for beauty product promotion. Experience with trending sounds and effects required.',
          role_needed: 'Short Form Editor',
          niches: ['Beauty', 'Fashion'],
          budget: 300,
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          status: 'active',
          applicant_count: 8,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: '3',
          title: 'Podcast Thumbnail Design Series',
          description: 'Looking for a designer to create consistent, eye-catching thumbnails for our weekly podcast episodes.',
          role_needed: 'Thumbnail Design',
          niches: ['Educational', 'Tech'],
          budget: 150,
          deadline: null,
          status: 'draft',
          applicant_count: 0,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
        {
          id: '4',
          title: 'YouTube Channel Strategy Consultation',
          description: 'Completed project for channel growth strategy and content planning. Great collaboration with the freelancer.',
          role_needed: 'Channel Strategy',
          niches: ['Educational', 'Finance'],
          budget: 800,
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (past)
          status: 'completed',
          applicant_count: 15,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 4,
        totalPages: 1
      },
      stats: {
        total: 4,
        active: 2,
        draft: 1,
        completed: 1,
        cancelled: 0
      }
    }
  };
};

export default function PostedJobsGrid() {
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['myJobs', statusFilter],
    queryFn: () => fetchMyJobs(statusFilter),
  });

  const handleEdit = (jobId) => {
    console.log('Edit job:', jobId);
    // Implement edit functionality - navigate to edit page or open modal
  };

  const handleViewApplications = (jobId) => {
    console.log('View applications for job:', jobId);
    navigate(`/ViewApplications/${jobId}`);
  };

  const handleToggleStatus = (jobId, action) => {
    console.log('Toggle status for job:', jobId, action);
    // Implement status toggle functionality (activate, pause, etc.)
  };

  const handleDelete = (jobId) => {
    console.log('Delete job:', jobId);
    // Implement delete functionality with confirmation
  };

  const handleViewDetails = (jobId) => {
    console.log('View details for job:', jobId);
    // Implement view details functionality
  };

  const handleCreateJob = () => {
    console.log('Create new job');
    // Navigate to job creation page
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800/70 border-slate-700 rounded-xl">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-6 bg-slate-700 rounded mb-4"></div>
                <div className="h-16 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-700">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">Failed to load your jobs. Please try again.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const jobs = data?.data?.jobs || [];
  const stats = data?.data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header with Stats and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Posted Jobs</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                Total: {stats.total || 0}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Active: {stats.active || 0}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                Draft: {stats.draft || 0}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                Completed: {stats.completed || 0}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-600">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={handleCreateJob}
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <Card className="bg-slate-800/70 border-slate-700 rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="text-slate-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {statusFilter ? `No ${statusFilter} jobs found` : 'No jobs posted yet'}
              </h3>
              <p className="text-sm">
                {statusFilter 
                  ? `Try adjusting your filter or check other statuses.`
                  : 'Start by creating your first job posting to find talented creators.'
                }
              </p>
            </div>
            {!statusFilter && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-4"
                onClick={handleCreateJob}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <PostedJobCard
              key={job.id}
              job={job}
              onEdit={handleEdit}
              onViewApplications={handleViewApplications}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}