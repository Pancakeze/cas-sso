// 运行时配置管理
// 配置从 /config.json 动态加载，支持不重新构建镜像修改配置

interface RuntimeConfig {
  CAS_BASE_URL: string;
  SSO_UC_URL: string;
}

let runtimeConfig: RuntimeConfig | null = null;

/**
 * 加载运行时配置
 * 从 /config.json 获取配置，失败则使用默认值
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  try {
    const response = await fetch('/config.json?t=' + Date.now());
    if (response.ok) {
      const config: RuntimeConfig = await response.json();
      runtimeConfig = config;
      console.log('[Config] 运行时配置加载成功:', runtimeConfig);
      return config;
    }
  } catch (error) {
    console.warn('[Config] 加载运行时配置失败，使用默认值:', error);
  }

  // 默认值（开发环境）
  const defaultConfig: RuntimeConfig = {
    CAS_BASE_URL: '/cas',
    SSO_UC_URL: 'http://172.38.110.237:9090/sso/login'
  };
  runtimeConfig = defaultConfig;
  return runtimeConfig;
}

/**
 * 获取当前配置
 * 必须先调用 loadRuntimeConfig()
 */
export function getConfig(): RuntimeConfig {
  if (!runtimeConfig) {
    throw new Error('[Config] 配置未加载，请先调用 loadRuntimeConfig()');
  }
  return runtimeConfig;
}
