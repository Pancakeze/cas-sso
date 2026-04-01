// CAS 客户端服务
// 优先读取 Vite 注入的环境变量，本地开发时回退到默认值
// 生产环境使用相对路径，通过 Nginx 反向代理解决跨域
const CAS_BASE_URL = (import.meta.env.VITE_CAS_BASE_URL as string) || '/cas';

// 获取当前页面地址作为 service
const getServiceUrl = () => {
  // 直接使用 window.location.origin 获取当前域名+端口
  // 自动适配任何部署环境（localhost、开发服务器、生产服务器）
  return window.location.origin;
};

export interface CASUser {
  username: string;
  userToken: string;       // 用户身份令牌（登录后生成，用于跨系统验证）
  attributes?: Record<string, any>;
}

/** 子系统定义 */
export interface SubSystem {
  id: string;
  name: string;            // 子系统名称
  description: string;     // 描述
  url: string;             // 子系统入口地址（接收 token 的页面）
  appToken: string;        // 子系统专属 appToken（预共享密钥）
  icon: string;            // emoji 或图标
  color: string;           // 主题色（用于卡片）
  status: 'online' | 'offline' | 'maintenance';
}

// ──────────────────────────────────────────────
// Token 工具
// ──────────────────────────────────────────────

/** 生成随机 token（hex 编码） */
export function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 生成用于跳转子系统的 URL
 * 在 query string 中携带 userToken、appToken、username、timestamp、nonce
 */
export function buildSubSystemUrl(
  subsystem: SubSystem,
  user: CASUser
): string {
  const nonce = generateToken(8);
  const timestamp = Date.now().toString();
  const params = new URLSearchParams({
    userToken: user.userToken,
    appToken: subsystem.appToken,
    username: user.username,
    timestamp,
    nonce,
    from: 'cas-portal',
  });
  const separator = subsystem.url.includes('?') ? '&' : '?';
  return `${subsystem.url}${separator}${params.toString()}`;
}

// ──────────────────────────────────────────────
// CAS 客户端
// ──────────────────────────────────────────────

export class CASClient {
  // 获取 CAS 登录地址
  static getLoginUrl(): string {
    const service = encodeURIComponent(getServiceUrl());
    return `${CAS_BASE_URL}/login?service=${service}`;
  }

  // 处理 CAS 回调
  static async handleCallback(ticket: string): Promise<CASUser> {
    const service = encodeURIComponent(getServiceUrl());

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

    // 解析属性（处理 cas: 命名空间）
    const attributes: Record<string, any> = {};
    
    // 方法1：尝试获取 cas:attributes 下的所有子元素
    const casAttrElements = doc.querySelectorAll('cas\\:attributes > *, attributes > *');
    casAttrElements.forEach(el => {
      // 去掉命名空间前缀
      const tagName = el.tagName.replace(/^cas:/, '');
      attributes[tagName] = el.textContent;
    });
    
    // 调试：打印解析到的属性
    console.log('[CAS] 解析到的 attributes:', attributes);

    // 优先使用后端返回的 JWT userToken，如果没有则生成随机 token（兼容旧版）
    const userToken = attributes['userToken'] || attributes['user-token'] || generateToken(32);

    return { username, userToken, attributes };
  }

  // 登出
  static logout(): void {
    window.location.href = `${CAS_BASE_URL}/logout?service=${encodeURIComponent(getServiceUrl())}`;
  }

  // 检查是否需要登录
  static checkAuth(): Promise<CASUser | null> {
    return new Promise((resolve) => {
      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('ticket');
      console.log('checkAuth - ticket:', ticket, 'URL:', window.location.href);

      if (ticket) {
        console.log('Processing ticket:', ticket);
        this.handleCallback(ticket)
          .then(user => {
            console.log('handleCallback success:', user);
            // 清除 URL 中的 ticket
            window.history.replaceState({}, '', window.location.pathname);
            resolve(user);
          })
          .catch(err => {
            console.error('handleCallback error:', err);
            resolve(null);
          });
      } else {
        resolve(null);
      }
    });
  }
}

// ──────────────────────────────────────────────
// 子系统本地存储管理
// ──────────────────────────────────────────────

const SUBSYSTEMS_KEY = 'cas_subsystems';

const DEFAULT_SUBSYSTEMS: SubSystem[] = [
  {
    id: 'oa',
    name: 'OA 办公系统',
    description: '企业内部办公自动化平台，处理审批、公告等日常办公事务',
    url: 'http://localhost:3001/sso-callback',
    appToken: generateToken(16),
    icon: '🏢',
    color: '#3b82f6',
    status: 'online',
  },
  {
    id: 'erp',
    name: 'ERP 管理系统',
    description: '企业资源计划系统，涵盖采购、库存、财务等核心业务',
    url: 'http://localhost:3002/sso-callback',
    appToken: generateToken(16),
    icon: '📊',
    color: '#10b981',
    status: 'online',
  },
  {
    id: 'crm',
    name: 'CRM 客户管理',
    description: '客户关系管理系统，跟踪销售线索和客户互动记录',
    url: 'http://localhost:3003/sso-callback',
    appToken: generateToken(16),
    icon: '🤝',
    color: '#f59e0b',
    status: 'maintenance',
  },
  {
    id: 'ehl-uc',
    name: 'ehl-uc',
    description: '统一用户中心',
    url: 'http://172.38.110.121:9090/sso/login',
    appToken: generateToken(16),
    icon: '🔐',
    color: '#8b5cf6',
    status: 'online',
  },
];

export function getSubSystems(): SubSystem[] {
  const stored = localStorage.getItem(SUBSYSTEMS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as SubSystem[];
    } catch {
      // ignore
    }
  }
  // 首次初始化
  localStorage.setItem(SUBSYSTEMS_KEY, JSON.stringify(DEFAULT_SUBSYSTEMS));
  return DEFAULT_SUBSYSTEMS;
}

export function saveSubSystems(systems: SubSystem[]): void {
  localStorage.setItem(SUBSYSTEMS_KEY, JSON.stringify(systems));
}

export function addSubSystem(system: Omit<SubSystem, 'id'>): SubSystem {
  const list = getSubSystems();
  const newItem: SubSystem = { ...system, id: generateToken(8) };
  list.push(newItem);
  saveSubSystems(list);
  return newItem;
}

export function updateSubSystem(id: string, updates: Partial<SubSystem>): void {
  const list = getSubSystems();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    saveSubSystems(list);
  }
}

export function deleteSubSystem(id: string): void {
  const list = getSubSystems().filter(s => s.id !== id);
  saveSubSystems(list);
}
