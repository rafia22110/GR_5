
import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type PlanType = 'free' | 'pro' | null;

interface AuthContextType {
  user: User | null;
  plan: PlanType;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => void;
  subscribe: (plan: 'free' | 'pro') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<PlanType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser({
      id: '1',
      name: email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });
    setIsLoading(false);
  };

  const loginGoogle = async () => {
    setIsLoading(true);
    // Simulate Google Auth
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser({
      id: '2',
      name: 'Gemini User',
      email: 'user@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
    });
    setIsLoading(false);
  };

  const subscribe = async (selectedPlan: 'free' | 'pro') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPlan(selectedPlan);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setPlan(null);
  };

  return (
    <AuthContext.Provider value={{ user, plan, isLoading, login, loginGoogle, logout, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
