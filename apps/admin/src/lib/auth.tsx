'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthControllerGetSession, useAuthControllerSignOut } from '@wira-borneo/api-client';

interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { data, isLoading, refetch } = useAuthControllerGetSession({
    query: {
      retry: false,
    }
  });

  const { mutateAsync: signOut } = useAuthControllerSignOut();

  const logout = async () => {
    await signOut();
    await refetch();
    router.push('/login');
  };

  const user = data?.user || null;
  const session = data?.session || null;

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
    if (!isLoading && user && pathname === '/login') {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
