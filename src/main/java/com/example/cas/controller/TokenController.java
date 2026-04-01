package com.example.cas.controller;

import com.example.cas.model.dto.PersonQueryRequest;
import com.example.cas.model.dto.PersonQueryResponse;
import com.example.cas.model.dto.UserTokenQueryResponse;
import com.example.cas.service.UserTokenService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户令牌 REST API 控制器
 * 按接口文档 5.3-5.5 规范
 * 服务基础路径: /token-server/sapi/
 */
@RestController
@RequestMapping("/token-server/sapi")
public class TokenController {

    private final UserTokenService userTokenService;

    public TokenController(UserTokenService userTokenService) {
        this.userTokenService = userTokenService;
    }

    /**
     * 5.3 用户令牌信息查询服务
     * 服务地址: http[s]://[ip]:[port]/token-server/sapi/queryusertoken
     *
     * @param userToken 用户令牌
     * @return UserTokenQueryResponse
     */
    @PostMapping("/queryusertoken")
    public UserTokenQueryResponse queryUserTokenInfo(@RequestParam String userToken) {
        return userTokenService.queryUserTokenInfo(userToken);
    }

    /**
     * 5.4 用户令牌核验服务
     * 服务地址: http[s]://[ip]:[port]/token-server/sapi/validateusertoken
     *
     * @param userToken 用户令牌
     * @return UserTokenQueryResponse
     */
    @PostMapping("/validateusertoken")
    public UserTokenQueryResponse validateUserToken(@RequestParam String userToken) {
        return userTokenService.validateUserToken(userToken);
    }

    /**
     * 5.5 人员信息查询服务
     * 服务地址: http[s]://[ip]:[port]/token-server/sapi/querypersoninfo
     *
     * @param request 查询请求参数
     * @return PersonQueryResponse
     */
    @PostMapping(value = "/querypersoninfo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PersonQueryResponse queryPersonInfo(@RequestBody PersonQueryRequest request) {
        return userTokenService.queryPersonInfo(request);
    }

    /**
     * 健康检查接口 - 已注释
     */
    // @GetMapping("/health")
    // public Map<String, Object> health() {
    //     return Map.of(
    //             "status", "UP",
    //             "service", "CAS Token Service",
    //             "timestamp", System.currentTimeMillis()
    //     );
    // }
}
