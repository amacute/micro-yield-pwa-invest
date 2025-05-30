import { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Video {
  id: string;
  duration: string;
  amount: number;
  watched: boolean;
}

interface Profile {
  full_name: string;
  wallet_balance: number;
  videos_watched_count: number;
  avatar_url: string | null;
}

const WatchVideos = () => {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([
    { id: '1', duration: '00:00:37', amount: 350, watched: false },
    { id: '2', duration: '00:00:15', amount: 350, watched: false },
    { id: '3', duration: '00:00:28', amount: 350, watched: false },
    { id: '4', duration: '00:00:30', amount: 350, watched: false },
  ]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, wallet_balance, videos_watched_count, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchVideo = async (videoId: string) => {
    if (!user || !profile) return;

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    // Start loading state
    toast.loading('Watching video...', { duration: 2000 });
    
    try {
      // Simulate video watching
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state optimistically
      const newWalletBalance = profile.wallet_balance + video.amount;
      const newVideosWatchedCount = profile.videos_watched_count + 1;

      setProfile(prev => prev ? {
        ...prev,
        wallet_balance: newWalletBalance,
        videos_watched_count: newVideosWatchedCount
      } : null);

      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId ? { ...v, watched: true } : v
        )
      );

      // Update Supabase profile
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_balance: newWalletBalance,
          videos_watched_count: newVideosWatchedCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update global auth context
      await updateUserProfile({
        walletBalance: newWalletBalance,
        videosWatched: newVideosWatchedCount
      });

      toast.success(`Earned ₦${video.amount.toFixed(2)}!`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to record earnings');
      
      // Revert optimistic updates on error
      await fetchProfile();
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId ? { ...v, watched: false } : v
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-400">
        <p>Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Summary Card */}
        <Card className="lg:col-span-4 bg-gradient-to-br from-yellow-900/20 to-yellow-700/20 border-yellow-600/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="w-12 h-12">
                <img
                  src={profile.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                  alt="User avatar"
                  className="object-cover"
                />
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {profile.full_name}
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">Total Profit</p>
                <p className="text-xl font-bold text-white">₦{profile.wallet_balance.toFixed(2)}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">Videos Watched</p>
                <p className="text-xl font-bold text-white">{profile.videos_watched_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Videos Section */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Available Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.filter(video => !video.watched).map((video) => (
              <Card 
                key={video.id}
                className="bg-gradient-to-br from-yellow-900/20 to-yellow-700/20 border-yellow-600/20 relative overflow-hidden group"
              >
                <CardContent className="p-6">
                  <button
                    onClick={() => handleWatchVideo(video.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PlayCircle className="w-12 h-12 text-white" />
                  </button>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">{video.duration}</p>
                    <p className="text-white">Watch and earn...</p>
                    <p className="text-lg font-semibold text-white">₦{video.amount.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {videos.filter(video => !video.watched).length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-8">
                No more videos available. Check back later!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchVideos; 