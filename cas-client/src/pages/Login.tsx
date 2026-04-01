import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, logout, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 已登录用户跳转到首页（使用 React Router）
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, isRedirecting]);

  // 正在加载或已登录（准备跳转）时显示加载状态
  if (isLoading || isAuthenticated || user) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-cyber-primary text-xl neon-text">
          {isLoading ? '加载中...' : '正在跳转...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 cyber-border rounded-full animate-glow">
            <svg className="w-10 h-10 text-cyber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 neon-text">统一身份认证</h1>
          <p className="text-gray-400">CAS Single Sign-On Platform</p>
        </div>

        {/* 登录卡片 */}
        <div className="cyber-border rounded-2xl p-8 backdrop-blur-sm bg-cyber-darker/50">
          <div className="text-center mb-6">
            <h2 className="text-xl text-white font-semibold">欢迎登录</h2>
            <p className="text-gray-400 text-sm mt-1">使用统一账号访问所有服务</p>
          </div>

          {/* 登录按钮 */}
          <button
            onClick={login}
            className="btn-cyber w-full py-4 px-6 bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 rounded-lg text-cyber-primary font-semibold text-lg flex items-center justify-center gap-3 hover:from-cyber-primary/30 hover:to-cyber-secondary/30 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            统一账号登录
          </button>

          {/* 分割线 */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent"></div>
            <span className="px-4 text-gray-500 text-sm">SECURE CONNECTION</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent"></div>
          </div>

          {/* 安全提示 */}
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <svg className="w-4 h-4 text-cyber-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>256位SSL加密保护</span>
          </div>

          {/* 退出登录按钮 - 用于已登录用户 */}
          <div className="mt-4 pt-4 border-t border-cyber-primary/20">
            <button
              onClick={logout}
              className="w-full py-2 px-4 text-gray-400 hover:text-cyber-primary text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-8 flex justify-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse"></div>
            <span>系统在线</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <div className="w-2 h-2 bg-cyber-primary rounded-full"></div>
            <span>CAS 3.0</span>
          </div>
        </div>
      </div>

      {/* 扫描线效果 */}
      <div className="scan-line"></div>
    </div>
  );
}
