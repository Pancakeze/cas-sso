package com.example.cas.service;

import com.example.cas.model.dto.PersonQueryRequest;
import com.example.cas.model.dto.PersonQueryResponse;
import com.example.cas.model.dto.PersonQueryV2Request;
import com.example.cas.model.dto.PersonQueryV2Response;
import com.example.cas.model.dto.UserTokenQueryResponse;

/**
 * 用户令牌服务接口
 */
public interface UserTokenService {

    /**
     * 查询用户令牌信息
     * 通过 userToken 查询用户的基本信息
     *
     * @param userToken 用户令牌
     * @return UserTokenQueryResponse 用户令牌查询响应
     */
    UserTokenQueryResponse queryUserTokenInfo(String userToken);

    /**
     * 验证用户令牌
     * 检测 userToken 是否有效（存在且未过期）
     *
     * @param userToken 用户令牌
     * @return UserTokenQueryResponse 验证结果响应
     */
    UserTokenQueryResponse validateUserToken(String userToken);

    /**
     * 人员信息查询（V1版本）
     * 根据条件查询人员详细信息
     *
     * @param request 查询请求参数
     * @return PersonQueryResponse 人员信息查询响应
     */
    PersonQueryResponse queryPersonInfo(PersonQueryRequest request);

    /**
     * 人员信息查询（V2版本）
     * 根据条件查询人员详细信息
     *
     * @param request 查询请求参数
     * @return PersonQueryV2Response 人员信息查询响应
     */
    PersonQueryV2Response queryPersonInfoV2(PersonQueryV2Request request);
}
