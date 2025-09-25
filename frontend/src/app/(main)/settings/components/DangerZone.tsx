'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/Authcontext';

interface DangerZoneProps {
  setError: (error: string) => void;
  setMessage: (message: string) => void;
}

export const DangerZone = ({ setError, setMessage }: DangerZoneProps) => {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      setMessage('Account deleted successfully. You will be redirected to the login page.');
      
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      setError(`Failed to delete account: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Sign out button */}
      <div className="pt-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>

      {/* Delete Account Section */}
      <div className="border-t pt-6 mt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                disabled={deleteLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteLoading ? 'Deleting Account...' : 'Delete Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers including your profile, preferences,
                  and any party history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
};
