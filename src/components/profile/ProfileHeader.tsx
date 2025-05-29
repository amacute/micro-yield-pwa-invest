
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Check, AlertTriangle } from 'lucide-react';
import { EditProfileDialog } from './dialogs/EditProfileDialog';

export function ProfileHeader() {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  if (!user) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-axiom-primary to-axiom-secondary" />
        <CardHeader className="relative pb-0">
          <div className="absolute -top-16 left-6 ring-4 ring-background">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profileImageUrl || user.avatar_url} />
              <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="pt-10 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              Edit Profile
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {user.kycVerified ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex gap-1 items-center">
                <Check className="h-3 w-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="flex gap-1 items-center">
                <AlertTriangle className="h-3 w-3" /> Unverified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-axiom-primary" />
            <span className="text-sm text-muted-foreground">Member since {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </>
  );
}
