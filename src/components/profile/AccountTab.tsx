
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Edit, Camera } from 'lucide-react';
import { EditProfileDialog } from './dialogs/EditProfileDialog';

export function AccountTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Account Information</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Full Name</div>
              <div className="font-medium">{user.name || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone Number</div>
              <div className="font-medium">{user.phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Country</div>
              <div className="font-medium">{user.country || 'Not selected'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Currency</div>
              <div className="font-medium">{user.currency} ({user.currencySymbol})</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">KYC Status</div>
              <div className="flex items-center gap-2">
                <Badge variant={user.kycVerified ? 'default' : 'secondary'}>
                  {user.kycVerified ? 'Verified' : 'Not Verified'}
                </Badge>
                {!user.kycVerified && (
                  <Button 
                    variant="link" 
                    className="text-axiom-primary p-0 h-auto text-sm"
                    onClick={() => navigate('/wallet#verification')}
                  >
                    Complete Verification
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {user.passportUrl && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Identity Document</div>
              <Badge variant="outline">Document Uploaded</Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      <EditProfileDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </div>
  );
}
