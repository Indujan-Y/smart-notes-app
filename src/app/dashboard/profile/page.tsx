
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/services/users';
import type { UserProfile } from '@/services/users';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  
  useEffect(() => {
    // Only proceed to fetch profile if auth is resolved and we have a user
    if (!authLoading && user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                setProfile(userProfile);
                setName(userProfile.name);
            } else {
                // If no profile is found for a logged-in user, it's an error state
                toast({
                    title: 'Error',
                    description: 'Could not find your profile data.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast({
                title: 'Error',
                description: 'Could not load your profile.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
      };
      fetchProfile();
    } else if (!authLoading && !user) {
      // If auth is resolved and there's no user, we can stop loading.
      // This case might happen if the user logs out in another tab.
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSaving(true);
    
    try {
      await updateUserProfile(user.uid, { name });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
       toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Keep showing loader as long as auth check is happening OR we are fetching data.
  if (authLoading || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // After loading, if there's still no profile, show the error message.
  if (!profile) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">Could not load user profile.</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
