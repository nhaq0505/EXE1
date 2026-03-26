import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const login = async (email: string, _password: string) => {
    // Mô phỏng gọi API 1 giây
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Ở đây không Validate pass, set cứng môt user
    setUser({ name: 'Người dùng Test', email });
    setIsLoginModalOpen(false); // tự đóng modal sau khi đăng nhập thành công
  };

  const logout = () => {
    setUser(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ user, isLoginModalOpen, login, logout, openLoginModal, closeLoginModal }}>
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
