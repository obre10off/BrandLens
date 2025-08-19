'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const {
  useSession,
  useUpdateUser,
  useListAccounts,
  useChangeEmail,
  useChangePassword,
  useDeleteUser,
  useRevokeSession,
  useRevokeSessions,
  useRevokeOtherSessions,
  useListSessions,
  useUpdateSession,
  useForgetPassword,
  useResetPassword,
  signIn,
  signOut,
  signUp,
} = authClient;
