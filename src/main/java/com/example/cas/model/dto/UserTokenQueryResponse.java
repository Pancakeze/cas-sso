package com.example.cas.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Map;

/**
 * 用户令牌查询响应
 * 按接口文档 5.3 规范
 */
public class UserTokenQueryResponse {
    private String status;          // 状态码，"0000" 表示成功
    private String message;         // 消息
    private TokenDetailResult result;  // 结果数据

    public UserTokenQueryResponse() {}

    public UserTokenQueryResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public boolean isSuccess() {
        return "0000".equals(status);
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public TokenDetailResult getResult() {
        return result;
    }

    public void setResult(TokenDetailResult result) {
        this.result = result;
    }

    /**
     * 令牌详细信息
     * 按接口文档 5.3.4 响应参数结构
     */
    public static class TokenDetailResult {
        private String pid;              // 用户唯一标识
        private String name;            // 用户名称
        private String orgCode;          // 组织机构编码
        private String mid;              // 终端设备标识
        private String env;              // 终端环境类型

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private String createTime;       // 用户令牌创建时间

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private String expireAt;          // 用户令牌到期时间

        private String id;                // 用户令牌ID

        // Getters and Setters
        public String getPid() {
            return pid;
        }

        public void setPid(String pid) {
            this.pid = pid;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getOrgCode() {
            return orgCode;
        }

        public void setOrgCode(String orgCode) {
            this.orgCode = orgCode;
        }

        public String getMid() {
            return mid;
        }

        public void setMid(String mid) {
            this.mid = mid;
        }

        public String getEnv() {
            return env;
        }

        public void setEnv(String env) {
            this.env = env;
        }

        public String getCreateTime() {
            return createTime;
        }

        public void setCreateTime(String createTime) {
            this.createTime = createTime;
        }

        public String getExpireAt() {
            return expireAt;
        }

        public void setExpireAt(String expireAt) {
            this.expireAt = expireAt;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }
    }
}
