package com.example.cas.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.UUID;

/**
 * 用户令牌信息
 * 对应 ehl-uc 子系统需要解析的用户信息结构
 */
public class UserInfo {
    
    private String pid;              // 用户唯一标识
    private String name;             // 用户名称
    private String orgCode;          // 组织机构编码
    private String mid;              // 终端设备标识
    private String env;              // 终端环境类型

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private String createTime;       // 用户令牌创建时间

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private String expireAt;         // 用户令牌到期时间

    private String id;               // 用户令牌ID
    
    public UserInfo() {
        this.id = UUID.randomUUID().toString().replace("-", "");
    }
    
    public UserInfo(String pid, String name, String orgCode) {
        this();
        this.pid = pid;
        this.name = name;
        this.orgCode = orgCode;
        this.mid = "";
        this.env = "web";
        this.createTime = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());
    }
    
    // 计算过期时间
    public void setExpireFromNow(long expirationMillis) {
        long expireTime = System.currentTimeMillis() + expirationMillis;
        this.expireAt = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date(expireTime));
    }

    // Getters and Setters
    public String getPid() { return pid; }
    public void setPid(String pid) { this.pid = pid; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getOrgCode() { return orgCode; }
    public void setOrgCode(String orgCode) { this.orgCode = orgCode; }
    
    public String getMid() { return mid; }
    public void setMid(String mid) { this.mid = mid; }
    
    public String getEnv() { return env; }
    public void setEnv(String env) { this.env = env; }
    
    public String getCreateTime() { return createTime; }
    public void setCreateTime(String createTime) { this.createTime = createTime; }
    
    public String getExpireAt() { return expireAt; }
    public void setExpireAt(String expireAt) { this.expireAt = expireAt; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}
