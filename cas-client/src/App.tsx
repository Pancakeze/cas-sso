import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SubSystemProvider } from './context/SubSystemContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Portal from './pages/Portal';
import SubSystemDetail from './pages/SubSystemDetail';
import Dashboard from './pages/Dashboard';
import SubSystemManager from './pages/SubSystemManager';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <SubSystemProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* 门户首页 - 显示子系统列表 */}
        <Route path="/" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
        {/* 子系统详情页 - 嵌入子系统 */}
        <Route path="/subsystem/:id" element={<ProtectedRoute><SubSystemDetail /></ProtectedRoute>} />
        {/* 旧版首页保留 */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/subsystems" element={<ProtectedRoute><SubSystemManager /></ProtectedRoute>} />
      </Routes>
    </SubSystemProvider>
  );
}

export default App;
