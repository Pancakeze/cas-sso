package com.example.cas.model.dto;

/**
 * 用户令牌查询请求
 */
public class UserTokenQueryRequest {
    private String userToken;

    public String getUserToken() {
        return userToken;
    }

    public void setUserToken(String userToken) {
        this.userToken = userToken;
    }
}
