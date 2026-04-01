import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { CASClient, CASUser, generateToken } from '../services/cas';

interface AuthContextType {
  user: CASUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CASUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ticketProcessed = useRef(false);

  // 初始化：检查 ticket 或本地存储
  useEffect(() => {
    const initAuth = async () => {
      // 防止 React StrictMode 重复执行
      if (ticketProcessed.current) {
        setIsLoading(false);
        return;
      }
      ticketProcessed.current = true;

      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('ticket');
      
      console.log('[Auth] Initializing, URL:', window.location.href);
      console.log('[Auth] Ticket found:', ticket);

      if (ticket) {
        try {
          // 清除 URL 参数（只执行一次）
          window.history.replaceState({}, '', window.location.pathname);
          console.log('[Auth] Processing ticket:', ticket);
          
          const authUser = await CASClient.handleCallback(ticket);
          console.log('[Auth] Ticket validated, user:', authUser);
          
          if (authUser) {
            setUser(authUser);
            localStorage.setItem('cas_user', JSON.stringify(authUser));
          }
        } catch (err) {
          console.error('[Auth] Ticket validation failed:', err);
        }
      } else {
        // 检查本地存储的登录状态
        const stored = localStorage.getItem('cas_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log('[Auth] Found stored user:', parsed.username);
            // 确保有 userToken
            if (!parsed.userToken) {
              parsed.userToken = generateToken(32);
              localStorage.setItem('cas_user', JSON.stringify(parsed));
            }
            setUser(parsed);
          } catch (e) {
            console.error('[Auth] Failed to parse stored user:', e);
            localStorage.removeItem('cas_user');
          }
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(() => {
    window.location.href = CASClient.getLoginUrl();
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cas_user');
    CASClient.logout();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
