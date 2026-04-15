import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CASClient, CASUser, generateToken } from '../services/cas';

interface AuthContextType {
  user: CASUser | null;
  setUser: (user: CASUser | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 关键修复：TicketHandler 组件 - 专门处理 CAS 回调中的 ticket
// 这个组件在 AuthProvider 内部渲染，会在任何页面挂载时检查 URL 中的 ticket
function TicketHandler() {
  const { user, isLoading, setUser } = useAuth();
  
  useEffect(() => {
    // 等待 AuthContext 初始化完成
    if (isLoading) return;
    
    // 已经有用户了，不需要处理 ticket
    if (user) return;
    
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    
    if (!ticket) return;
    
    console.log('[TicketHandler] Found ticket in URL:', ticket);
    
    // 清除 URL 参数
    window.history.replaceState({}, '', window.location.pathname);
    
    // 处理 ticket
    CASClient.handleCallback(ticket)
      .then(authUser => {
        if (authUser) {
          console.log('[TicketHandler] Ticket validated:', authUser.username);
          // 保存到 localStorage
          localStorage.setItem('cas_user', JSON.stringify(authUser));
          // 直接设置用户状态，无需重载页面
          setUser(authUser);
        }
      })
      .catch(err => {
        console.error('[TicketHandler] Ticket validation failed:', err);
      });
  }, [user, isLoading, setUser]);
  
  // 不渲染任何内容
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CASUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：检查本地存储的登录状态
  useEffect(() => {
    const initAuth = async () => {
      console.log('[Auth] Initializing...');
      
      // 先检查 localStorage
      const stored = localStorage.getItem('cas_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('[Auth] Found stored user:', parsed.username);
          if (!parsed.userToken) {
            parsed.userToken = generateToken(32);
            localStorage.setItem('cas_user', JSON.stringify(parsed));
          }
          setUser(parsed);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('[Auth] Failed to parse stored user:', e);
          localStorage.removeItem('cas_user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async () => {
    const loginUrl = await CASClient.getLoginUrl();
    window.location.href = loginUrl;
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
      setUser,
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {/* TicketHandler 处理 CAS 回调中的 ticket */}
      <TicketHandler />
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
