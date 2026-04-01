import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen cyber-bg">
      {/* 导航 */}
      <nav className="cyber-border border-x-0 border-t-0 bg-cyber-darker/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold">Dashboard</span>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-cyber-primary">
            退出
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="cyber-border rounded-xl p-8">
          <h1 className="text-2xl text-white font-bold mb-4">仪表盘</h1>
          <p className="text-gray-300">当前用户: {user?.username}</p>
        </div>
      </main>
    </div>
  );
}
