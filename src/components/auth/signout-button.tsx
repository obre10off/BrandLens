'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import { toast } from 'sonner';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Signed out successfully');
            router.push('/');
          },
        },
      });
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}