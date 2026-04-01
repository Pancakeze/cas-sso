# CAS 单点登录前端

## 技术栈
- React 18 + TypeScript
- Vite
- Tailwind CSS

## 项目结构

```
cas-client/
├── public/
├── src/
│   ├── components/
│   │   ├── LoginButton.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── cas.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   └── Dashboard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 1. package.json

```json
{
  "name": "cas-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

---

## 2. index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CAS 统一身份认证</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 3. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          'dark': '#0a0e17',
          'darker': '#050810',
          'primary': '#00f0ff',
          'secondary': '#7b2cbf',
          'accent': '#00ff88',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00f0ff, 0 0 20px #00f0ff' },
          '100%': { boxShadow: '0 0 10px #00f0ff, 0 0 40px #00f0ff, 0 0 60px #00f0ff' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
```

---

## 4. postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 5. vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8443',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 6. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 7. tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 8. src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0e17;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 科技感背景 */
.cyber-bg {
  background: 
    linear-gradient(180deg, rgba(0, 240, 255, 0.03) 0%, transparent 50%),
    linear-gradient(90deg, rgba(123, 44, 191, 0.05) 0%, transparent 50%),
    #0a0e17;
  position: relative;
}

.cyber-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

/* 霓虹文字 */
.neon-text {
  text-shadow: 
    0 0 5px #00f0ff,
    0 0 10px #00f0ff,
    0 0 20px #00f0ff,
    0 0 40px #00f0ff;
}

/* 科技边框 */
.cyber-border {
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 
    inset 0 0 20px rgba(0, 240, 255, 0.1),
    0 0 20px rgba(0, 240, 255, 0.1);
}

/* 扫描线效果 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f0ff, transparent);
  animation: scan 3s linear infinite;
}

/* 输入框聚焦效果 */
input:focus {
  outline: none;
  border-color: #00f0ff;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

/* 按钮悬停效果 */
.btn-cyber {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-cyber::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn-cyber:hover::before {
  left: 100%;
}

.btn-cyber:hover {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
}
```

---

## 9. src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

## 10. src/services/cas.ts

```typescript
// CAS 客户端服务

const CAS_BASE_URL = 'http://localhost:8443/cas';
const CLIENT_SERVICE_URL = 'http://localhost:3000';

export interface CASUser {
  username: string;
  attributes?: Record<string, any>;
}

export class CASClient {
  // 获取 CAS 登录地址
  static getLoginUrl(): string {
    const service = encodeURIComponent(CLIENT_SERVICE_URL);
    return `${CAS_BASE_URL}/login?service=${service}`;
  }

  // 处理 CAS 回调
  static async handleCallback(ticket: string): Promise<CASUser> {
    const service = encodeURIComponent(CLIENT_SERVICE_URL);
    
    const response = await fetch(
      `${CAS_BASE_URL}/serviceValidate?service=${service}&ticket=${ticket}`
    );

    const xml = await response.text();
    return this.parseCASResponse(xml);
  }

  // 解析 CAS XML 响应
  static parseCASResponse(xml: string): CASUser {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const success = doc.querySelector('authenticationSuccess');
    if (!success) {
      const failure = doc.querySelector('authenticationFailure');
      throw new Error(failure?.textContent || 'Authentication failed');
    }

    const username = doc.querySelector('user')?.textContent || '';
    
    // 解析属性
    const attributes: Record<string, any> = {};
    const attrElements = doc.querySelectorAll('attributes > *');
    attrElements.forEach(el => {
      attributes[el.tagName] = el.textContent;
    });

    return { username, attributes };
  }

  // 登出
  static logout(): void {
    const service = encodeURIComponent(CLIENT_SERVICE_URL);
    window.location.href = `${CAS_BASE_URL}/logout?service=${CLIENT_SERVICE_URL}`;
  }

  // 检查是否需要登录
  static checkAuth(): Promise<CASUser | null> {
    return new Promise((resolve) => {
      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('ticket');

      if (ticket) {
        this.handleCallback(ticket)
          .then(user => {
            // 清除 URL 中的 ticket
            window.history.replaceState({}, '', window.location.pathname);
            resolve(user);
          })
          .catch(() => resolve(null));
      } else {
        resolve(null);
      }
    });
  }
}
```

---

## 11. src/context/AuthContext.tsx

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CASClient, CASUser } from '../services/cas';

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

  useEffect(() => {
    // 检查是否已认证
    CASClient.checkAuth().then(authUser => {
      if (authUser) {
        setUser(authUser);
        // 存储用户信息到 localStorage
        localStorage.setItem('cas_user', JSON.stringify(authUser));
      } else {
        // 检查 localStorage
        const stored = localStorage.getItem('cas_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = () => {
    window.location.href = CASClient.getLoginUrl();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cas_user');
    CASClient.logout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
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
```

---

## 12. src/App.tsx

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-cyber-primary text-xl neon-text">加载中...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
```

---

## 13. src/pages/Login.tsx

```tsx
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = '/';
    return null;
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
```

---

## 14. src/pages/Home.tsx

```tsx
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen cyber-bg">
      {/* 导航栏 */}
      <nav className="cyber-border border-x-0 border-t-0 bg-cyber-darker/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 cyber-border rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">CAS Portal</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-8 h-8 cyber-border rounded-full flex items-center justify-center">
                <span className="text-cyber-primary text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{user?.username}</span>
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

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">
          欢迎回来, <span className="text-cyber-primary">{user?.username}</span>
        </h1>

        {/* 服务卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: '用户中心', desc: '管理个人账号信息', icon: '👤' },
            { name: '应用管理', desc: '查看已授权的应用', icon: '📱' },
            { name: '安全设置', desc: '修改密码和安全选项', icon: '🔒' },
            { name: '审计日志', desc: '查看登录历史记录', icon: '📋' },
            { name: 'API 访问', desc: '获取 API 调用凭证', icon: '🔑' },
            { name: '帮助中心', desc: '获取帮助和支持', icon: '❓' },
          ].map((item, index) => (
            <div
              key={index}
              className="cyber-border rounded-xl p-6 hover:bg-cyber-primary/5 transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-cyber-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## 15. src/pages/Dashboard.tsx

```tsx
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
```

---

## 启动方式

```bash
cd cas-client
npm install
npm run dev
```

访问 http://localhost:3000 即可看到科技感登录界面。
