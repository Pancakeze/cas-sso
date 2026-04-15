import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubSystems } from '../services/cas';
import { SubSystem } from '../services/cas';

export default function Portal() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [subSystems, setSubSystems] = useState<SubSystem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // 清除本地存储的子系统数据，重新加载最新配置
      // 这确保我们能获取到最新的子系统配置（包括 ehl-uc 的内网地址）
      localStorage.removeItem('cas_subsystems');
      
      // 获取所有子系统
      getSubSystems().then(systems => {
        console.log('加载子系统列表:', systems);
        setSubSystems(systems);
        setLoading(false);
      });
    }
  }, [user]);

  // 跳转到子系统详情页
  const goToSubSystem = (systemId: string) => {
    navigate(`/subsystem/${systemId}`);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-cyber-primary text-xl neon-text">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-white text-xl">请先登录</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg">
      {/* 顶部导航 */}
      <div className="h-16 bg-gray-900/80 backdrop-blur-sm border-b border-cyan-400/20 flex items-center justify-between px-8 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
            <span className="text-xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-white neon-text">统一门户</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full flex items-center justify-center border border-emerald-400/30">
              <span className="text-sm">👤</span>
            </div>
            <div className="text-gray-300 text-sm">
              当前用户: <span className="text-white font-semibold">{user.username}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white text-sm rounded-lg border border-gray-600 hover:border-cyan-400/50 transition-all flex items-center gap-2"
          >
            <span>🚪</span>
            退出
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="pt-16 px-8 py-8">
        {/* 欢迎区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 neon-text">欢迎回来，{user.username}</h2>
          <p className="text-gray-400 text-lg">选择您要访问的子系统</p>
        </div>

        {/* 子系统网格 - 每排5个 */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {subSystems.map((system) => (
              <div
                key={system.id}
                onClick={() => goToSubSystem(system.id)}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-cyan-400/50 transition-all cursor-pointer overflow-hidden"
              >
                {/* 悬停光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* 状态指示器 */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${
                    system.status === 'online' ? 'bg-emerald-400 animate-pulse' :
                    system.status === 'maintenance' ? 'bg-yellow-400 animate-pulse' :
                    'bg-gray-500'
                  }`}></div>
                </div>

                {/* 图标 */}
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-cyan-400/30 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{system.icon}</span>
                </div>

                {/* 内容 */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {system.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {system.description}
                  </p>
                  
                  {/* 状态标签 */}
                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      system.status === 'online' ? 'bg-emerald-400/10 text-emerald-400' :
                      system.status === 'maintenance' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {system.status === 'online' ? '在线' :
                       system.status === 'maintenance' ? '维护中' :
                       '离线'}
                    </span>
                  </div>
                </div>

                {/* 点击提示 */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex items-center justify-center">
                    <span className="text-cyan-400 text-sm">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-16 text-gray-500">
          <p className="mb-2">💡 点击子系统卡片即可进入</p>
          <p className="text-sm">系统管理员可以在子系统管理中配置访问权限</p>
          
          {/* 调试信息：显示 ehl-uc 配置 */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-xs text-gray-600 mb-2">🔧 调试信息（ehl-uc 配置）</p>
            <div className="text-xs text-gray-500 break-all">
              {(() => {
                const ehlUc = subSystems.find(s => s.id === 'ehl-uc');
                return ehlUc ? (
                  <div>
                    <div>地址: {ehlUc.url}</div>
                    <div>AppToken: {ehlUc.appToken.substring(0, 8)}...</div>
                  </div>
                ) : 'ehl-uc 未配置';
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
