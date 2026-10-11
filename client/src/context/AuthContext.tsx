import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { fetchAuthMe, switchDemoRole } from '../api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isDemo: boolean;
  isLoading: boolean;
  changeRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'coordinator',
  isDemo: true,
  isLoading: true,
  changeRole: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('coordinator');
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAuthMe();
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role);
          setIsDemo(data.isDemo);
        }
      } catch (err) {
        console.warn('Failed to load initial auth me, using default coordinator state', err);
        setUser({
          id: 'usr-coordinator-tariq',
          displayName: 'Tariq Al-Mansoor',
          email: 'tariq.mansoor@civictwin.demo',
          role: 'coordinator'
        });
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const changeRole = async (newRole: UserRole) => {
    try {
      const res = await switchDemoRole(newRole);
      if (res.user) {
        setUser(res.user);
        setRole(res.user.role);
      }
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isDemo, isLoading, changeRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
