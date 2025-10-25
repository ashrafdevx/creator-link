
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Medal, TrendingUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

const ROLES = ["Long Form Editor", "Short Form Editor", "Thumbnail Design", "Scriptwriting", "Channel Strategy", "Clipping", "Animation", "SEO/Title Optimization"];
const NICHES = ["Gaming", "Beauty", "Sports", "IRL", "Finance", "Comedy", "Tech", "Educational"];

const LeaderboardCard = ({ freelancer, rank, onProfileClick }) => {
  const rankColor = rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-slate-400' : rank === 3 ? 'border-amber-600' : 'border-slate-700';
  const rankIcon = rank === 1 ? <Crown className="h-6 w-6 text-yellow-400" /> : rank === 2 ? <Medal className="h-6 w-6 text-slate-400" /> : rank === 3 ? <TrendingUp className="h-6 w-6 text-amber-600" /> : <span className="text-lg font-bold text-white">{rank}</span>;

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || 'S';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.05 }}>
      <Card className={`bg-slate-900 border-2 ${rankColor} transition-all hover:bg-slate-700 cursor-pointer`} onClick={() => onProfileClick(freelancer)}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex items-center justify-center w-12">{rankIcon}</div>
          <Avatar className="h-12 w-12">
            <AvatarImage src={freelancer.user?.profile_image_url || freelancer.user?.picture} alt={freelancer.user?.full_name} className="object-cover" />
            <AvatarFallback className="bg-slate-700 text-white">{getInitials(freelancer.user?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-white flex items-center gap-2">
              {freelancer.user?.public_name || freelancer.user?.full_name || 'Specialist'}
              {freelancer.is_active && (
                <Badge variant="outline" className="bg-green-500 text-white border-green-600 px-2 py-0.5 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              )}
            </h3>
            <p className="text-sm text-slate-300">{freelancer.headline || 'Professional Specialist'}</p>
          </div>
          <div className="text-center w-28">
            <p className="font-bold text-lg text-white">{freelancer.jobs_completed || 0}</p>
            <p className="text-xs text-slate-400">Jobs Completed</p>
          </div>
          <div className="text-center w-28 flex items-center justify-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <p className="font-bold text-lg text-white">{(freelancer.average_rating || 0).toFixed(1)}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Leaderboard() {
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [filters, setFilters] = useState({ role: 'all', niche: 'all' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      
      try {
        const [profiles, publicProfiles, users] = await Promise.all([
            FreelancerProfile.list().catch((e) => {
              console.warn("Error fetching FreelancerProfile:", e);
              return [];
            }),
            PublicUserProfile.list().catch((e) => {
              console.warn("Error fetching PublicUserProfile:", e);
              return [];
            }),
            User.list().catch((e) => {
              console.warn("Error fetching User:", e);
              return [];
            })
        ]);

        console.log('✅ Freelancer profiles loaded:', profiles.length);
        console.log('✅ Public profiles loaded:', publicProfiles.length);
        console.log('✅ Users loaded:', users.length);

        const usersMap = new Map();
        
        // Prioritize PublicUserProfile for data
        publicProfiles.forEach(p => {
            if (!usersMap.has(p.user_id)) {
                usersMap.set(p.user_id, {
                    id: p.user_id,
                    full_name: p.full_name,
                    public_name: p.public_name,
                    profile_image_url: p.profile_image_url
                });
            }
        });

        // Fill in with User data if missing
        users.forEach(u => {
            if (!usersMap.has(u.id)) {
                usersMap.set(u.id, u);
            }
        });
        
        // Combine profiles with user data, ensuring no profile is dropped
        const freelancersWithUserData = profiles.map((p, index) => {
            let user = usersMap.get(p.user_id);
            // If user data is still missing, create a stable fallback
            if (!user) {
                user = {
                    id: p.user_id,
                    full_name: `Specialist`,
                    public_name: `Specialist`,
                    profile_image_url: `https://ui-avatars.com/api/?name=S&background=6366f1&color=fff`
                };
            }
            
            return {
                ...p,
                user: user,
                // FIX: Use 0 as default instead of random numbers
                jobs_completed: p.jobs_completed || 0,
                average_rating: p.average_rating || 0,
                is_active: p.is_active !== false // Ensure is_active is boolean, default to true
            };
        });
        
        console.log('Final freelancers with user data:', freelancersWithUserData.length);
        setFreelancers(freelancersWithUserData);
        
      } catch (error) {
        console.error("Critical error loading leaderboard data:", error);
        setLoadingError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleProfileClick = (freelancer) => {
    navigate(createPageUrl(`CreatorProfile?userId=${freelancer.user_id}`));
  };

  const filteredAndRanked = useMemo(() => {
    return freelancers
      .filter(f => 
        (filters.role === 'all' || (f.roles && f.roles.includes(filters.role))) &&
        (filters.niche === 'all' || (f.niches && f.niches.includes(filters.niche)))
      )
      .sort((a, b) => {
        // Calculate scores using existing defaults (0 for missing values)
        const scoreA = (a.jobs_completed || 0) * 0.6 + (a.average_rating || 0) * 0.4;
        const scoreB = (b.jobs_completed || 0) * 0.6 + (b.average_rating || 0) * 0.4;
        return scoreB - scoreA;
      });
  }, [freelancers, filters]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-white mb-4" />
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Leaderboard</h2>
          <p className="text-slate-400 mb-4">Error: {loadingError}</p>
          <p className="text-sm text-slate-500">This might be a permissions issue. Please check entity access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Crelance Leaderboard</h1>
        <p className="mt-4 text-lg text-slate-400">Discover the top-performing freelancers in the community.</p>
      </div>

      <Card className="bg-slate-900 border-slate-700 mb-8 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <p className="font-semibold text-white">Filters:</p>
          <Select value={filters.role} onValueChange={(value) => setFilters(f => ({ ...f, role: value }))}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700 hover:text-white focus:text-white">All Roles</SelectItem>
              {ROLES.map(r => (
                <SelectItem key={r} value={r} className="text-white hover:bg-slate-700 focus:bg-slate-700 hover:text-white focus:text-white">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.niche} onValueChange={(value) => setFilters(f => ({ ...f, niche: value }))}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Niche" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700 hover:text-white focus:text-white">All Niches</SelectItem>
              {NICHES.map(n => (
                <SelectItem key={n} value={n} className="text-white hover:bg-slate-700 focus:bg-slate-700 hover:text-white focus:text-white">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
      
      {freelancers.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-slate-900/50 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-400 text-lg mb-2">No freelancer profiles found</p>
          <p className="text-slate-500 text-sm">This could be due to:</p>
          <ul className="text-slate-500 text-sm mt-2 space-y-1">
            <li>• No freelancer profiles have been created yet</li>
            <li>• Entity permissions need to be set to "No Restrictions"</li>
            <li>• Profiles are in draft/inactive state</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndRanked.length > 0 ? (
            filteredAndRanked.map((freelancer, index) => (
              <LeaderboardCard key={freelancer.id} freelancer={freelancer} rank={index + 1} onProfileClick={handleProfileClick} />
            ))
          ) : (
            <div className="text-center py-10 bg-slate-900/50 rounded-lg">
              <p className="text-slate-400">No freelancers found for this combination.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
