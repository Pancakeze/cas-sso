package com.example.cas.service;

import com.example.cas.model.User;
import com.example.cas.model.UserInfo;
import com.example.cas.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    /**
     * Redis key 前缀
     */
    private static final String USER_TOKEN_PREFIX = "cas:user:token:";
    private static final String USER_PREFIX = "cas:user:";

    private final Map<String, User> users = new ConcurrentHashMap<>(); // username -> User

    /** Redis 操作模板，本地开发无 Redis 时为 null */
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;
    private final JwtUtil jwtUtil;

    /**
     * Token 过期时间（小时）
     */
    @Value("${jwt.expiration:24}")
    private int tokenExpirationHours;

    public AuthenticationService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;

        // 初始化默认用户
        User admin = new User("admin", "admin123", Map.of(
            "role", "admin", 
            "realName", "管理员",
            "orgCode", "ORG001",
            "orgName", "默认组织",
            "idcard", "120223199402014444",
            "phone", "13800138000",
            "email", "admin@example.com"
        ));
        users.put("admin", admin);

        User user = new User("user", "user123", Map.of(
            "role", "user", 
            "realName", "普通用户",
            "orgCode", "ORG002",
            "orgName", "测试组织",
            "idcard", "110101199001011234",
            "phone", "13900139000",
            "email", "user@example.com"
        ));
        users.put("user", user);

        log.info("AuthenticationService 初始化完成，默认用户: admin, user");
    }

    /**
     * 认证用户并生成 JWT userToken
     */
    public User authenticate(String username, String password) {
        User user = users.get(username);
        if (user != null && user.getPassword().equals(password)) {
            // 生成 JWT token
            Map<String, Object> extra = new java.util.HashMap<>();
            extra.put("userId", username);
            extra.put("roles", user.getAttributes().getOrDefault("role", "user"));

            String userToken = jwtUtil.generateToken(username, extra);

            // 存入 Redis（本地无 Redis 时跳过）
            if (redisTemplate != null) {
                try {
                    String redisKey = USER_TOKEN_PREFIX + userToken;
                    redisTemplate.opsForValue().set(redisKey, username, tokenExpirationHours, TimeUnit.HOURS);
                    String userInfoKey = USER_PREFIX + username;
                    redisTemplate.opsForHash().put(userInfoKey, "username", username);
                    redisTemplate.opsForHash().put(userInfoKey, "userToken", userToken);
                    redisTemplate.opsForHash().put(userInfoKey, "expireTime", String.valueOf(System.currentTimeMillis() + tokenExpirationHours * 3600 * 1000L));
                    user.getAttributes().forEach((k, v) -> redisTemplate.opsForHash().put(userInfoKey, k, v));
                    redisTemplate.expire(userInfoKey, tokenExpirationHours, TimeUnit.HOURS);
                } catch (Exception e) {
                    log.warn("Redis 存储失败: {}", e.getMessage());
                }
            }

            log.info("用户 {} 登录成功，生成 JWT userToken: {}", username, userToken.substring(0, 20) + "...");

            // 返回脱敏后的用户信息（不返回密码）
            return new User(user.getUsername(), null, user.getAttributes());
        }
        return null;
    }

    /**
     * 根据 userToken 获取用户信息（从 Redis 验证）
     */
    public Optional<User> getUserByToken(String userToken) {
        if (userToken == null || userToken.isBlank()) {
            return Optional.empty();
        }

        // 先尝试解析 JWT
        if (!jwtUtil.validateToken(userToken)) {
            log.warn("JWT token 无效或已过期");
            return Optional.empty();
        }

        // 从 Redis 获取用户名（本地无 Redis 时仅用 JWT 验证）
        if (redisTemplate != null) {
            String redisKey = USER_TOKEN_PREFIX + userToken;
            Object usernameObj = redisTemplate.opsForValue().get(redisKey);
            if (usernameObj != null) {
                String username = usernameObj.toString();
                User user = users.get(username);
                if (user != null) {
                    redisTemplate.expire(redisKey, tokenExpirationHours, TimeUnit.HOURS);
                    return Optional.of(user);
                }
            }
        }

        // fallback: 仅通过 JWT 解析用户名
        try {
            String username = jwtUtil.getUsernameFromToken(userToken);
            return Optional.ofNullable(users.get(username));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /**
     * 验证 userToken 是否有效
     */
    public boolean validateUserToken(String userToken) {
        return getUserByToken(userToken).isPresent();
    }

    /**
     * 存储 userToken 到 Redis（不验证密码，用于 CAS 登录成功后生成 token）
     * 生成符合 ehl-uc 子系统要求的 JWT 格式
     */
    public String storeUserToken(String username) {
        User user = users.get(username);
        if (user == null) {
            return null;
        }

        // 创建用户令牌信息
        UserInfo userInfo = new UserInfo();
        userInfo.setPid(username);  // 用户唯一标识
        userInfo.setName((String) user.getAttributes().getOrDefault("realName", username)); // 用户名称
        userInfo.setOrgCode((String) user.getAttributes().getOrDefault("orgCode", "ORG001")); // 组织机构编码
        userInfo.setMid(""); // 终端设备标识（默认空）
        userInfo.setEnv("web"); // 终端环境类型
        
        // 计算过期时间（毫秒）
        long expirationMillis = tokenExpirationHours * 60 * 60 * 1000L;
        userInfo.setExpireFromNow(expirationMillis);

        // 生成 JWT token，载荷包含完整的用户信息
        String userToken = jwtUtil.generateToken(username, userInfoToMap(userInfo));

        // 存入 Redis（本地无 Redis 时跳过）
        if (redisTemplate != null) {
            try {
                String redisKey = USER_TOKEN_PREFIX + userToken;
                redisTemplate.opsForValue().set(redisKey, username, tokenExpirationHours, TimeUnit.HOURS);
            } catch (Exception e) {
                log.warn("Redis 存储 userToken 失败: {}", e.getMessage());
            }
        }

        log.info("为用户 {} 生成 JWT userToken", username);

        return userToken;
    }
    
    /**
     * 将 UserInfo 转换为 Map 用于 JWT 载荷
     */
    private Map<String, Object> userInfoToMap(UserInfo userInfo) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("pid", userInfo.getPid());
        map.put("name", userInfo.getName());
        map.put("orgCode", userInfo.getOrgCode());
        map.put("mid", userInfo.getMid());
        map.put("env", userInfo.getEnv());
        map.put("createTime", userInfo.getCreateTime());
        map.put("expireAt", userInfo.getExpireAt());
        map.put("id", userInfo.getId());
        return map;
    }

    /**
     * 根据用户名查询用户
     */
    public Optional<User> getUserByUsername(String username) {
        return Optional.ofNullable(users.get(username));
    }

    /**
     * 获取所有用户
     */
    public Map<String, User> getUsers() {
        return users;
    }

    /**
     * 登出：删除 Redis 中的 userToken
     */
    public void logout(String userToken) {
        if (userToken != null && !userToken.isBlank()) {
            if (redisTemplate != null) {
                redisTemplate.delete(USER_TOKEN_PREFIX + userToken);
            }
            log.info("用户登出，删除 token: {}", userToken.substring(0, 10) + "...");
        }
    }
}
