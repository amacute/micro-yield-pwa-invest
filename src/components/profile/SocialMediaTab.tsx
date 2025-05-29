
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Facebook, 
  Linkedin,
  Plus,
  Trash2,
  Link,
  Video
} from 'lucide-react';

interface SocialMediaLink {
  id: string;
  platform: string;
  username: string;
  url: string;
}

interface UserVideo {
  id: string;
  platform: string;
  video_url: string;
  title: string;
  description: string;
  posted_date: string;
}

const PLATFORMS = [
  { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { name: 'Twitter', icon: Twitter, color: 'bg-blue-500' },
  { name: 'YouTube', icon: Youtube, color: 'bg-red-500' },
  { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { name: 'TikTok', icon: Video, color: 'bg-black' },
];

export function SocialMediaTab() {
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newLink, setNewLink] = useState({ platform: '', username: '', url: '' });
  const [newVideo, setNewVideo] = useState({ 
    platform: '', 
    video_url: '', 
    title: '', 
    description: '', 
    posted_date: '' 
  });

  useEffect(() => {
    if (user) {
      fetchSocialLinks();
      fetchVideos();
    }
  }, [user]);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_social_media')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      toast.error('Failed to load social media links');
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('user_videos')
        .select('*')
        .eq('user_id', user?.id)
        .order('posted_date', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = async () => {
    if (!newLink.platform || !newLink.username) {
      toast.error('Please fill in platform and username');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_social_media')
        .insert({
          user_id: user?.id,
          platform: newLink.platform,
          username: newLink.username,
          url: newLink.url
        });

      if (error) throw error;
      
      setNewLink({ platform: '', username: '', url: '' });
      fetchSocialLinks();
      toast.success('Social media link added successfully');
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social media link');
    }
  };

  const addVideo = async () => {
    if (!newVideo.platform || !newVideo.video_url || !newVideo.title) {
      toast.error('Please fill in platform, video URL, and title');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_videos')
        .insert({
          user_id: user?.id,
          platform: newVideo.platform,
          video_url: newVideo.video_url,
          title: newVideo.title,
          description: newVideo.description,
          posted_date: newVideo.posted_date || new Date().toISOString()
        });

      if (error) throw error;
      
      setNewVideo({ platform: '', video_url: '', title: '', description: '', posted_date: '' });
      fetchVideos();
      toast.success('Video added successfully');
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video');
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_social_media')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSocialLinks();
      toast.success('Social media link deleted');
    } catch (error) {
      console.error('Error deleting social link:', error);
      toast.error('Failed to delete social media link');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchVideos();
      toast.success('Video deleted');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.name.toLowerCase() === platform.toLowerCase());
    return platformData || { name: platform, icon: Link, color: 'bg-gray-500' };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Social Media Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Social Media Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Links */}
          <div className="grid gap-3">
            {socialLinks.map((link) => {
              const platformData = getPlatformIcon(link.platform);
              const Icon = platformData.icon;
              
              return (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${platformData.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{link.platform}</p>
                      <p className="text-sm text-muted-foreground">@{link.username}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSocialLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Add New Link Form */}
          <div className="space-y-3">
            <h4 className="font-medium">Add Social Media Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                >
                  <option value="">Select Platform</option>
                  {PLATFORMS.map(platform => (
                    <option key={platform.name} value={platform.name}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newLink.username}
                  onChange={(e) => setNewLink({ ...newLink, username: e.target.value })}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="url">Profile URL (Optional)</Label>
                <Input
                  id="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button onClick={addSocialLink} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Social Media Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Videos Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Posted Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Videos */}
          <div className="grid gap-3">
            {videos.map((video) => {
              const platformData = getPlatformIcon(video.platform);
              const Icon = platformData.icon;
              
              return (
                <div key={video.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platformData.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">{video.platform}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteVideo(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {video.description && (
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {new Date(video.posted_date).toLocaleDateString()}
                    </Badge>
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Video
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Add New Video Form */}
          <div className="space-y-3">
            <h4 className="font-medium">Add Posted Video</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="video-platform">Platform</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newVideo.platform}
                  onChange={(e) => setNewVideo({ ...newVideo, platform: e.target.value })}
                >
                  <option value="">Select Platform</option>
                  {PLATFORMS.map(platform => (
                    <option key={platform.name} value={platform.name}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={newVideo.video_url}
                  onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>
            
            <div>
              <Label htmlFor="video-description">Description (Optional)</Label>
              <Textarea
                id="video-description"
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                placeholder="Enter video description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="posted-date">Posted Date</Label>
              <Input
                id="posted-date"
                type="date"
                value={newVideo.posted_date}
                onChange={(e) => setNewVideo({ ...newVideo, posted_date: e.target.value })}
              />
            </div>
            
            <Button onClick={addVideo} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
