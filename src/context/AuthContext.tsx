import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractRole = (data: any): string | undefined => {
  if (!data) return undefined;
  let role = data.role || data.Role || data.userRole || data.UserRole;
  if (!role && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (key.toLowerCase() === 'role') {
        role = data[key];
        break;
      }
    }
  }
  return role;
};

const sanitizeUser = (profileData: any): User => {
  const rawRole = extractRole(profileData);
  let role = 'Customer';
  if (rawRole) {
    const rawLower = rawRole.toString().toLowerCase();
    if (rawLower === 'farmowner' || rawLower === 'farm_owner') {
      role = 'FarmOwner';
    } else if (rawLower === 'admin') {
      role = 'Admin';
    } else {
      role = rawRole;
    }
  }
  return {
    id: profileData.id || profileData.Id || profileData.uid || profileData.nameid,
    name: profileData.name || profileData.Name || profileData.username || profileData.email?.split('@')[0] || 'User',
    email: profileData.email || profileData.Email || '',
    phone: profileData.phone || profileData.Phone || profileData.phoneNumber || '',
    address: profileData.address || profileData.Address || '',
    role: role,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem('green_solution_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(sanitizeUser(profile));
        } catch (error) {
          console.error('Auto login failed:', error);
          localStorage.removeItem('green_solution_token');
          setUser(null);
        }
      }
    };
    autoLogin();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const response = await authService.login(email, password);
    const token = response.token || response.accessToken;
    if (token) {
      localStorage.setItem('green_solution_token', token);
    }
    
    let loggedInUser: User;
    if (response.user) {
      loggedInUser = sanitizeUser(response.user);
    } else {
      const profile = await authService.getProfile();
      loggedInUser = sanitizeUser(profile);
    }
    
    setUser(loggedInUser);
    setIsLoginModalOpen(false);
    return loggedInUser;
  };

  const register = async (name: string, email: string, password: string): Promise<User | null> => {
    const response = await authService.register(name, email, password);
    const token = response.token || response.accessToken;
    if (token) {
      localStorage.setItem('green_solution_token', token);
    }
    
    let registeredUser: User;
    if (response.user) {
      registeredUser = sanitizeUser(response.user);
    } else {
      const profile = await authService.getProfile();
      registeredUser = sanitizeUser(profile);
    }
    
    setUser(registeredUser);
    setIsLoginModalOpen(false);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('green_solution_token');
    setUser(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ user, isLoginModalOpen, login, register, logout, openLoginModal, closeLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
