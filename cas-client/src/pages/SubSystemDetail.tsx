import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubSystems, generateToken } from '../services/cas';
import { SubSystem } from '../services/cas';

export default function SubSystemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [subSystem, setSubSystem] = useState<SubSystem | null>(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [subSystemError, setSubSystemError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      getSubSystems().then(systems => {
        const found = systems.find((s: SubSystem) => s.id === id);
        
        if (!found) {
          setSubSystemError('子系统不存在');
          setLoading(false);
          return;
        }

        setSubSystem(found);

        // 生成带 token 的 URL
        const nonce = generateToken(8);
        const timestamp = Date.now().toString();
        
        const params = new URLSearchParams({
          userToken: user.userToken || '',
          appToken: found.appToken,
          username: user.username || '',
          timestamp,
          nonce,
          from: 'cas-portal',
        });
        
        const finalUrl = `${found.url}?${params.toString()}`;
        console.log(`[SubSystemDetail] 跳转URL: ${finalUrl}`);
        console.log(`[SubSystemDetail] userToken: ${user.userToken}`);
        console.log(`[SubSystemDetail] appToken: ${found.appToken}`);
        setIframeUrl(finalUrl);
        setLoading(false);
      });
    }
  }, [id, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">请先登录</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-cyber-primary text-xl neon-text">加载子系统中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 顶部导航 */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2"
          >
            <span>←</span>
            返回门户
          </button>
          <span className="text-2xl">{subSystem?.icon || '🔐'}</span>
          <span className="text-white font-bold text-lg">{subSystem?.name || '子系统'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-gray-300 text-sm">
            当前用户: <span className="text-white font-semibold">{user.username}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            退出
          </button>
        </div>
      </div>

      {/* 子系统 iframe 嵌入区域 */}
      <div className="flex-1 relative bg-white">
        {subSystemError ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-xl mb-2 text-gray-700">子系统加载失败</div>
            <div className="text-gray-500 max-w-md text-center px-6 mb-4">
              {subSystemError}
            </div>
            <div className="text-xs text-gray-400 mb-4 px-4">
              <p>如果子系统不支持iframe嵌入，您可以：</p>
              <p className="mt-1">1. 点击下方按钮直接跳转</p>
              <p>2. 或复制下方链接在新窗口打开</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(iframeUrl, '_blank')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                新窗口打开
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(iframeUrl);
                  alert('链接已复制到剪贴板');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              >
                复制链接
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                返回门户
              </button>
            </div>
          </div>
        ) : iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title={subSystem?.name}
            allow="clipboard-read; clipboard-write; same-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => {
              setSubSystemError('子系统页面加载失败，可能由于网络问题、CORS限制或服务器配置了X-Frame-Options');
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            正在加载子系统...
          </div>
        )}
      </div>
    </div>
  );
}