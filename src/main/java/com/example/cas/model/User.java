package com.example.cas.model;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class User {
    private String username;
    private String password;
    private String userToken;     // 用户令牌
    private Map<String, Object> attributes;
    private Long createTime;      // 创建时间
    private Long expireTime;      // 过期时间

    public User() {
        this.createTime = System.currentTimeMillis();
        this.attributes = new ConcurrentHashMap<>();
    }

    public User(String username, String password, Map<String, Object> attributes) {
        this();
        this.username = username;
        this.password = password;
        this.attributes = attributes != null ? attributes : new ConcurrentHashMap<>();
    }

    // 检查 token 是否过期
    public boolean isTokenExpired() {
        if (expireTime == null) {
            return false; // 无过期时间视为永不过期
        }
        return System.currentTimeMillis() > expireTime;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getUserToken() { return userToken; }
    public void setUserToken(String userToken) { this.userToken = userToken; }
    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
    public Long getCreateTime() { return createTime; }
    public void setCreateTime(Long createTime) { this.createTime = createTime; }
    public Long getExpireTime() { return expireTime; }
    public void setExpireTime(Long expireTime) { this.expireTime = expireTime; }
}
