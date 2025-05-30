import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';

const TikTokTask = () => {
  const { user } = useAuth();
  const [postLink, setPostLink] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [tiktokProfile, setTiktokProfile] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTikTokProfile();
    }
  }, [user]);

  const fetchTikTokProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tiktok_profile_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data?.tiktok_profile_url) {
        setTiktokProfile(data.tiktok_profile_url);
      }
    } catch (error) {
      console.error('Error fetching TikTok profile:', error);
      toast.error('Failed to load TikTok profile');
    }
  };

  const handleUpdateSocial = async () => {
    if (!user) {
      toast.error('Please log in to update your profile');
      return;
    }

    if (!tiktokProfile) {
      toast.error('Please enter your TikTok profile URL');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tiktok_profile_url: tiktokProfile })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('TikTok profile updated successfully');
    } catch (error) {
      console.error('Error updating TikTok profile:', error);
      toast.error('Failed to update TikTok profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a task');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms before proceeding');
      return;
    }

    if (!postLink) {
      toast.error('Please enter a TikTok post link');
      return;
    }

    setLoading(true);
    try {
      // First, check if the user has set their TikTok profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tiktok_profile_url')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.tiktok_profile_url) {
        toast.error('Please update your TikTok profile URL first');
        return;
      }

      // Submit the task
      const submission: Tables<'tiktok_submissions'> = {
        id: crypto.randomUUID(),
        user_id: user.id,
        video_url: postLink,
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tiktok_submissions')
        .insert([submission]);

      if (error) throw error;

      toast.success('Task submitted successfully!');
      setPostLink('');
      setAcceptedTerms(false);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>TikTok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={tiktokProfile}
                onChange={(e) => setTiktokProfile(e.target.value)}
                placeholder="Enter your TikTok profile URL"
                className="bg-muted"
              />
              <Button
                variant="secondary"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                onClick={handleUpdateSocial}
                disabled={loading}
              >
                Update Social
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Post Link</label>
                <Input
                  placeholder="https://"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Notice</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ensure the video post has more than 5K views before you apply</li>
                    <li>• False applications might result in permanent account suspension and all earnings forfeited</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    disabled={loading}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and accepted
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!acceptedTerms || loading}
                >
                  {loading ? 'Processing...' : 'Proceed...'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default TikTokTask; 