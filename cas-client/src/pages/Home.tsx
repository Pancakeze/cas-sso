import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubSystems } from '../context/SubSystemContext';
import { buildSubSystemUrl, SubSystem } from '../services/cas';

// ─── Token 跳转确认弹窗 ─────────────────────────────────────────────────────

interface JumpModalProps {
  system: SubSystem;
  userToken: string;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function JumpModal({ system, userToken, username, onConfirm, onCancel }: JumpModalProps) {
  const truncate = (s: string, n = 20) => s.length > n ? s.slice(0, n) + '...' : s;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="cyber-border rounded-2xl p-8 bg-cyber-darker/95 w-full max-w-md mx-4 animate-fade-in">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{system.icon}</span>
          <div>
            <h2 className="text-white font-bold text-xl">{system.name}</h2>
            <p className="text-gray-400 text-sm">即将跳转至子系统</p>
          </div>
        </div>

        {/* Token 信息展示 */}
        <div className="space-y-3 mb-6">
          <div className="bg-black/40 border border-cyber-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">当前用户</p>
            <p className="text-cyber-primary font-mono text-sm">{username}</p>
          </div>
          <div className="bg-black/40 border border-cyber-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">User Token</p>
            <p className="text-cyber-accent font-mono text-xs break-all">{userToken}</p>
          </div>
          <div className="bg-black/40 border border-cyber-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">App Token</p>
            <p className="text-cyber-secondary font-mono text-xs break-all">{truncate(system.appToken, 40)}</p>
          </div>
          <div className="bg-black/40 border border-cyber-primary/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">目标系统地址</p>
            <p className="text-gray-300 font-mono text-xs break-all">{system.url}</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs mb-6 text-center">
          以上凭证将通过 URL 参数安全传递给子系统进行身份验证
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200 transition-all text-sm"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 text-cyber-primary font-semibold hover:from-cyber-primary/30 hover:to-cyber-secondary/30 transition-all text-sm btn-cyber"
          >
            确认跳转
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 子系统卡片 ──────────────────────────────────────────────────────────────

interface SystemCardProps {
  system: SubSystem;
  onLaunch: (system: SubSystem) => void;
}

function SystemCard({ system, onLaunch }: SystemCardProps) {
  const statusConfig = {
    online: { label: '在线', color: 'bg-cyber-accent', textColor: 'text-cyber-accent' },
    offline: { label: '离线', color: 'bg-red-500', textColor: 'text-red-400' },
    maintenance: { label: '维护中', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  };

  const st = statusConfig[system.status];
  const isAvailable = system.status === 'online';

  return (
    <div
      className={`cyber-border rounded-xl p-6 group transition-all duration-300 ${
        isAvailable
          ? 'hover:bg-cyber-primary/5 hover:border-cyber-primary/60 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={() => isAvailable && onLaunch(system)}
      style={{ '--accent': system.color } as React.CSSProperties}
    >
      {/* 顶部：图标 + 状态 */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{system.icon}</span>
        <span className={`flex items-center gap-1.5 text-xs ${st.textColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.color} ${system.status === 'online' ? 'animate-pulse' : ''}`}></span>
          {st.label}
        </span>
      </div>

      {/* 标题 */}
      <h3 className={`font-semibold text-lg mb-2 transition-colors ${
        isAvailable ? 'text-white group-hover:text-cyber-primary' : 'text-gray-400'
      }`}>
        {system.name}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{system.description}</p>

      {/* 底部：地址 + 跳转 */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-xs font-mono truncate max-w-[160px]">{system.url}</span>
        {isAvailable && (
          <span className="text-cyber-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            进入系统
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 门户主页 ────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, logout } = useAuth();
  const { systems } = useSubSystems();
  const navigate = useNavigate();

  const [pendingSystem, setPendingSystem] = useState<SubSystem | null>(null);
  const [jumpLog, setJumpLog] = useState<{ system: string; time: string; url: string }[]>([]);

  const handleLaunch = (system: SubSystem) => {
    setPendingSystem(system);
  };

  const handleConfirmJump = () => {
    if (!pendingSystem || !user) return;

    const targetUrl = buildSubSystemUrl(pendingSystem, user);

    // 记录跳转日志
    setJumpLog(prev => [
      { system: pendingSystem.name, time: new Date().toLocaleTimeString(), url: targetUrl },
      ...prev.slice(0, 4),
    ]);

    setPendingSystem(null);
    window.open(targetUrl, '_blank');
  };

  const onlineCount = systems.filter(s => s.status === 'online').length;
  const totalCount = systems.length;

  return (
    <div className="min-h-screen cyber-bg">
      {/* ── 导航栏 ── */}
      <nav className="cyber-border border-x-0 border-t-0 bg-cyber-darker/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 cyber-border rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-lg">SSO Portal</span>
              <span className="ml-2 text-xs text-cyber-primary/60">单点登录门户</span>
            </div>
          </div>

          {/* 右侧：用户信息 + 操作 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/subsystems')}
              className="flex items-center gap-2 px-4 py-2 cyber-border rounded-lg text-cyber-primary text-sm hover:bg-cyber-primary/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              管理子系统
            </button>

            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-8 h-8 cyber-border rounded-full flex items-center justify-center">
                <span className="text-cyber-primary text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white text-sm">{user?.username}</p>
                <p className="text-gray-500 text-xs font-mono">{user?.userToken?.slice(0, 12)}...</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-400 hover:text-cyber-primary transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      {/* ── 主内容 ── */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* 欢迎 + 统计 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              欢迎回来，<span className="text-cyber-primary neon-text">{user?.username}</span>
            </h1>
            <p className="text-gray-400 text-sm">通过单点登录访问所有已授权的子系统</p>
          </div>

          <div className="flex gap-4">
            <div className="cyber-border rounded-xl px-6 py-4 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-cyber-primary">{onlineCount}</p>
              <p className="text-gray-400 text-xs mt-1">系统在线</p>
            </div>
            <div className="cyber-border rounded-xl px-6 py-4 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-white">{totalCount}</p>
              <p className="text-gray-400 text-xs mt-1">总系统数</p>
            </div>
          </div>
        </div>

        {/* 已授权子系统标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-cyber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            已授权子系统
          </h2>
          <button
            onClick={() => navigate('/subsystems')}
            className="text-cyber-primary text-sm hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加子系统
          </button>
        </div>

        {/* 子系统卡片网格 */}
        {systems.length === 0 ? (
          <div className="cyber-border rounded-xl p-16 text-center">
            <p className="text-5xl mb-4">🔌</p>
            <p className="text-gray-400 text-lg mb-2">暂无子系统</p>
            <p className="text-gray-600 text-sm mb-6">点击"添加子系统"配置第一个子系统</p>
            <button
              onClick={() => navigate('/subsystems')}
              className="btn-cyber px-6 py-3 bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 rounded-lg text-cyber-primary"
            >
              立即配置
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map(system => (
              <SystemCard key={system.id} system={system} onLaunch={handleLaunch} />
            ))}
          </div>
        )}

        {/* 跳转日志 */}
        {jumpLog.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              本次会话跳转记录
            </h2>
            <div className="cyber-border rounded-xl overflow-hidden">
              {jumpLog.map((log, i) => (
                <div key={i} className={`px-6 py-3 flex items-center gap-4 ${i !== jumpLog.length - 1 ? 'border-b border-cyber-primary/10' : ''}`}>
                  <span className="text-cyber-accent text-xs font-mono w-20 shrink-0">{log.time}</span>
                  <span className="text-white text-sm w-32 shrink-0">{log.system}</span>
                  <span className="text-gray-500 text-xs font-mono truncate">{log.url}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token 信息卡 */}
        <div className="mt-10 cyber-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            当前会话凭证
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">用户名</p>
              <p className="text-cyber-primary font-mono">{user?.username}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">User Token（用于子系统验证）</p>
              <p className="text-cyber-accent font-mono text-xs break-all">{user?.userToken}</p>
            </div>
          </div>
        </div>

      </main>

      {/* 跳转确认弹窗 */}
      {pendingSystem && user && (
        <JumpModal
          system={pendingSystem}
          userToken={user.userToken}
          username={user.username}
          onConfirm={handleConfirmJump}
          onCancel={() => setPendingSystem(null)}
        />
      )}

      {/* 扫描线 */}
      <div className="scan-line"></div>
    </div>
  );
}
