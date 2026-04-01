import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubSystems } from '../context/SubSystemContext';
import { SubSystem, generateToken } from '../services/cas';
import { useAuth } from '../context/AuthContext';

// ─── 颜色选项 ────────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  '#00f0ff', '#7b2cbf', '#10b981', '#3b82f6',
  '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
];

const ICON_OPTIONS = [
  '🏢', '📊', '🤝', '🔑', '📋', '📱', '💼', '🌐',
  '🔒', '📦', '🎯', '⚡', '🔬', '🏥', '🏫', '🛒',
];

// ─── 表单组件 ────────────────────────────────────────────────────────────────

interface SystemFormData {
  name: string;
  description: string;
  url: string;
  appToken: string;
  icon: string;
  color: string;
  status: SubSystem['status'];
}

const emptyForm = (): SystemFormData => ({
  name: '',
  description: '',
  url: 'http://localhost:',
  appToken: generateToken(16),
  icon: '🌐',
  color: '#00f0ff',
  status: 'online',
});

interface SystemFormProps {
  initial?: SystemFormData;
  onSubmit: (data: SystemFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

function SystemForm({ initial, onSubmit, onCancel, submitLabel = '保存' }: SystemFormProps) {
  const [form, setForm] = useState<SystemFormData>(initial ?? emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '请输入系统名称';
    if (!form.url.trim() || !form.url.startsWith('http')) e.url = '请输入有效的 URL（以 http 开头）';
    if (!form.appToken.trim()) e.appToken = '请输入 App Token';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const set = (field: keyof SystemFormData) => (val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 图标 + 颜色 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-xs block mb-2">系统图标</label>
          <div className="grid grid-cols-8 gap-1">
            {ICON_OPTIONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => set('icon')(icon)}
                className={`text-xl p-1 rounded transition-all ${
                  form.icon === icon ? 'bg-cyber-primary/20 scale-110' : 'hover:bg-white/5'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs block mb-2">主题色</label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => set('color')(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  form.color === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 系统名称 */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">系统名称 *</label>
        <input
          value={form.name}
          onChange={e => set('name')(e.target.value)}
          placeholder="例：OA 办公系统"
          className="w-full bg-black/30 border border-cyber-primary/20 focus:border-cyber-primary rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* 描述 */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">系统描述</label>
        <textarea
          value={form.description}
          onChange={e => set('description')(e.target.value)}
          placeholder="简短描述该子系统的用途..."
          rows={2}
          className="w-full bg-black/30 border border-cyber-primary/20 focus:border-cyber-primary rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all resize-none"
        />
      </div>

      {/* 入口 URL */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">入口地址（SSO 回调 URL）*</label>
        <input
          value={form.url}
          onChange={e => set('url')(e.target.value)}
          placeholder="http://your-system.com/sso-callback"
          className="w-full bg-black/30 border border-cyber-primary/20 focus:border-cyber-primary rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all font-mono"
        />
        {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
      </div>

      {/* App Token */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">App Token（预共享密钥）*</label>
        <div className="flex gap-2">
          <input
            value={form.appToken}
            onChange={e => set('appToken')(e.target.value)}
            className="flex-1 bg-black/30 border border-cyber-primary/20 focus:border-cyber-primary rounded-lg px-4 py-2.5 text-cyber-accent text-sm outline-none font-mono"
          />
          <button
            type="button"
            onClick={() => set('appToken')(generateToken(16))}
            className="px-3 py-2 cyber-border rounded-lg text-cyber-primary text-xs hover:bg-cyber-primary/10 transition-all whitespace-nowrap"
          >
            重新生成
          </button>
        </div>
        {errors.appToken && <p className="text-red-400 text-xs mt-1">{errors.appToken}</p>}
      </div>

      {/* 状态 */}
      <div>
        <label className="text-gray-400 text-xs block mb-2">系统状态</label>
        <div className="flex gap-3">
          {(['online', 'offline', 'maintenance'] as const).map(s => {
            const labels = { online: '在线', offline: '离线', maintenance: '维护中' };
            const colors = { online: 'text-cyber-accent border-cyber-accent/50', offline: 'text-red-400 border-red-400/50', maintenance: 'text-yellow-400 border-yellow-400/50' };
            return (
              <button
                key={s}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, status: s }))}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  form.status === s
                    ? `${colors[s]} bg-white/5`
                    : 'text-gray-500 border-gray-700 hover:border-gray-500'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200 transition-all text-sm"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 text-cyber-primary font-semibold hover:from-cyber-primary/30 hover:to-cyber-secondary/30 transition-all text-sm btn-cyber"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────

export default function SubSystemManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { systems, addSystem, updateSystem, removeSystem } = useSubSystems();

  type Mode = 'list' | 'add' | 'edit';
  const [mode, setMode] = useState<Mode>('list');
  const [editTarget, setEditTarget] = useState<SubSystem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = (data: SystemFormData) => {
    addSystem({ ...data });
    setMode('list');
  };

  const handleEdit = (data: SystemFormData) => {
    if (!editTarget) return;
    updateSystem(editTarget.id, { ...data });
    setEditTarget(null);
    setMode('list');
  };

  const startEdit = (system: SubSystem) => {
    setEditTarget(system);
    setMode('edit');
  };

  const handleDelete = (id: string) => {
    removeSystem(id);
    setDeleteConfirm(null);
  };

  const statusBadge = (s: SubSystem['status']) => {
    const map = {
      online: 'text-cyber-accent',
      offline: 'text-red-400',
      maintenance: 'text-yellow-400',
    };
    const labels = { online: '在线', offline: '离线', maintenance: '维护中' };
    return <span className={`text-xs ${map[s]}`}>{labels[s]}</span>;
  };

  return (
    <div className="min-h-screen cyber-bg">
      {/* ── 导航 ── */}
      <nav className="cyber-border border-x-0 border-t-0 bg-cyber-darker/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-cyber-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg">子系统管理</h1>
          <span className="text-gray-500 text-sm ml-auto">当前用户: {user?.username}</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* 列表模式 */}
        {mode === 'list' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">共 {systems.length} 个子系统</p>
              <button
                onClick={() => setMode('add')}
                className="flex items-center gap-2 btn-cyber px-5 py-2.5 bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 rounded-lg text-cyber-primary text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加子系统
              </button>
            </div>

            {systems.length === 0 ? (
              <div className="cyber-border rounded-xl p-16 text-center">
                <p className="text-5xl mb-4">🔌</p>
                <p className="text-gray-400 text-lg mb-6">暂无子系统配置</p>
                <button
                  onClick={() => setMode('add')}
                  className="btn-cyber px-6 py-3 bg-gradient-to-r from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/50 rounded-lg text-cyber-primary"
                >
                  添加第一个子系统
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {systems.map(system => (
                  <div key={system.id} className="cyber-border rounded-xl p-5 flex items-center gap-4 hover:bg-cyber-primary/3 transition-all">
                    <span className="text-3xl">{system.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{system.name}</span>
                        {statusBadge(system.status)}
                      </div>
                      <p className="text-gray-500 text-sm truncate">{system.description || '暂无描述'}</p>
                      <p className="text-gray-600 text-xs font-mono truncate mt-1">{system.url}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(system)}
                          className="px-3 py-1.5 text-xs text-cyber-primary border border-cyber-primary/30 rounded-lg hover:bg-cyber-primary/10 transition-all"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(system.id)}
                          className="px-3 py-1.5 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-all"
                        >
                          删除
                        </button>
                      </div>
                      <p className="text-gray-600 text-xs font-mono">Token: {system.appToken.slice(0, 12)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 添加模式 */}
        {mode === 'add' && (
          <div className="cyber-border rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-white font-bold text-xl mb-6">添加子系统</h2>
            <SystemForm
              onSubmit={handleAdd}
              onCancel={() => setMode('list')}
              submitLabel="添加子系统"
            />
          </div>
        )}

        {/* 编辑模式 */}
        {mode === 'edit' && editTarget && (
          <div className="cyber-border rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-white font-bold text-xl mb-6">编辑子系统</h2>
            <SystemForm
              initial={{
                name: editTarget.name,
                description: editTarget.description,
                url: editTarget.url,
                appToken: editTarget.appToken,
                icon: editTarget.icon,
                color: editTarget.color,
                status: editTarget.status,
              }}
              onSubmit={handleEdit}
              onCancel={() => { setMode('list'); setEditTarget(null); }}
              submitLabel="保存修改"
            />
          </div>
        )}
      </main>

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="cyber-border rounded-xl p-8 bg-cyber-darker/95 w-full max-w-sm mx-4">
            <div className="text-center mb-6">
              <p className="text-5xl mb-3">⚠️</p>
              <h3 className="text-white font-bold text-lg mb-2">确认删除</h3>
              <p className="text-gray-400 text-sm">
                删除后该子系统将从门户中移除，此操作不可恢复。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 hover:border-gray-400 transition-all text-sm"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm font-semibold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scan-line"></div>
    </div>
  );
}

