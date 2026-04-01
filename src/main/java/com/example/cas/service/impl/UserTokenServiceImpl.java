package com.example.cas.service.impl;

import com.example.cas.model.User;
import com.example.cas.model.dto.PersonQueryRequest;
import com.example.cas.model.dto.PersonQueryResponse;
import com.example.cas.model.dto.PersonQueryV2Request;
import com.example.cas.model.dto.PersonQueryV2Response;
import com.example.cas.model.dto.UserTokenQueryResponse;
import com.example.cas.service.AuthenticationService;
import com.example.cas.service.UserTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserTokenServiceImpl implements UserTokenService {

    private static final Logger log = LoggerFactory.getLogger(UserTokenServiceImpl.class);
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private final AuthenticationService authenticationService;

    public UserTokenServiceImpl(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * 查询用户令牌信息
     * 接口地址: /token-server/sapi/queryusertoken
     * 按接口文档 5.3 规范
     */
    @Override
    public UserTokenQueryResponse queryUserTokenInfo(String userToken) {
        log.info("开始查询用户令牌信息，userToken: {}", maskToken(userToken));

        // 参数校验
        if (userToken == null || userToken.isBlank()) {
            log.warn("用户令牌为空");
            return createErrorResponse("E0000001", "用户令牌不能为空");
        }

        try {
            Optional<User> userOpt = authenticationService.getUserByToken(userToken);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                UserTokenQueryResponse response = new UserTokenQueryResponse("0000", "");

                // 构建结果 - 按接口文档字段
                UserTokenQueryResponse.TokenDetailResult result = new UserTokenQueryResponse.TokenDetailResult();
                result.setId(userToken);                          // 用户令牌ID
                result.setPid(user.getUsername());                // 用户唯一标识
                result.setName(user.getUsername());                // 用户名称
                result.setOrgCode((String) user.getAttributes().getOrDefault("orgCode", ""));  // 组织机构编码
                result.setMid("0000");                            // 终端设备标识
                result.setEnv("pc");                              // 终端环境类型

                // 时间格式化
                if (user.getCreateTime() != null) {
                    result.setCreateTime(DATE_FORMAT.format(new Date(user.getCreateTime())));
                }
                if (user.getExpireTime() != null) {
                    result.setExpireAt(DATE_FORMAT.format(new Date(user.getExpireTime())));
                }

                response.setResult(result);
                log.info("用户令牌信息查询成功，用户名: {}", user.getUsername());
                return response;
            } else {
                log.warn("用户令牌无效或已过期");
                return createErrorResponse("E020300D", "系统获取请求Token节点信息失败");
            }
        } catch (Exception e) {
            log.error("查询用户令牌信息异常", e);
            return createErrorResponse("E020300D", "系统获取请求Token节点信息失败");
        }
    }

    /**
     * 验证用户令牌
     * 接口地址: /token-server/sapi/validateusertoken
     * 按接口文档 5.4 规范
     */
    @Override
    public UserTokenQueryResponse validateUserToken(String userToken) {
        log.info("开始核验用户令牌，userToken: {}", maskToken(userToken));

        // 参数校验
        if (userToken == null || userToken.isBlank()) {
            log.warn("用户令牌为空");
            return createErrorResponse("E0000001", "用户令牌不能为空");
        }

        try {
            boolean valid = authenticationService.validateUserToken(userToken);

            if (valid) {
                log.info("用户令牌核验通过");
                return new UserTokenQueryResponse("0000", "");
            } else {
                log.warn("用户令牌无效或已过期");
                return createErrorResponse("E020300D", "系统获取请求Token节点信息失败");
            }
        } catch (Exception e) {
            log.error("核验用户令牌异常", e);
            return createErrorResponse("E020300D", "系统获取请求Token节点信息失败");
        }
    }

    /**
     * 人员信息查询（V1版本）
     * 接口地址: /token-server/sapi/querypersoninfo
     * 按接口文档 5.5 规范
     */
    @Override
    public PersonQueryResponse queryPersonInfo(PersonQueryRequest request) {
        log.info("开始查询人员信息，请求参数: {}", request);

        // 参数校验：至少提供一个查询条件
        if (isAllBlank(request.getIds(), request.getIdcard(), request.getUserName(),
                request.getPinyin(), request.getOrgCode(), request.getPoliceNo())) {
            log.warn("查询参数不能为空");
            return createPersonErrorResponse("E0000001", "查询参数不能为空，必须至少提供一个查询条件");
        }

        try {
            // 从用户列表中查询
            Map<String, User> users = authenticationService.getUsers();
            List<PersonQueryResponse.PersonInfo> matchedUsers = new ArrayList<>();

            for (User user : users.values()) {
                if (matchesRequest(user, request)) {
                    PersonQueryResponse.PersonInfo info = new PersonQueryResponse.PersonInfo();
                    info.setPid(user.getUsername());
                    info.setUserName(user.getUsername());
                    info.setIdcard((String) user.getAttributes().get("idcard"));
                    info.setOrgCode((String) user.getAttributes().get("orgCode"));
                    info.setOrgName((String) user.getAttributes().get("orgName"));
                    info.setPhone((String) user.getAttributes().get("phone"));
                    info.setEmail((String) user.getAttributes().get("email"));
                    matchedUsers.add(info);
                }
            }

            // 构建响应
            PersonQueryResponse response = new PersonQueryResponse("0000", "");
            PersonQueryResponse.PersonResult result = new PersonQueryResponse.PersonResult();
            result.setTotal(matchedUsers.size());

            // 分页处理
            int start = request.getStart() != null ? request.getStart() : 0;
            int size = request.getSize() != null ? request.getSize() : 100;
            int end = Math.min(start + size, matchedUsers.size());

            if (start < matchedUsers.size()) {
                result.setRows(matchedUsers.subList(start, end));
            } else {
                result.setRows(new ArrayList<>());
            }

            response.setResult(result);
            log.info("人员信息查询成功，数据量: {}", matchedUsers.size());
            return response;

        } catch (Exception e) {
            log.error("查询人员信息异常", e);
            return createPersonErrorResponse("E020300D", "系统查询人员信息失败：" + e.getMessage());
        }
    }

    /**
     * 人员信息查询（V2版本）
     * 接口地址: /uac/openAPI/queryPerson/v2
     * 按接口文档 6.1 规范
     */
    @Override
    public PersonQueryV2Response queryPersonInfoV2(PersonQueryV2Request request) {
        log.info("开始查询人员信息（V2），请求参数: {}", request);

        // 参数校验：至少提供一个查询条件
        if (isAllBlank(request.getIds(), request.getIdcard(), request.getUserName(),
                request.getPinyin(), request.getOrgCode(), request.getPoliceNo())) {
            log.warn("查询参数不能为空");
            return createPersonV2ErrorResponse("E0000001", "查询参数不能为空，必须至少提供一个查询条件");
        }

        try {
            // 从用户列表中查询
            Map<String, User> users = authenticationService.getUsers();
            List<PersonQueryV2Response.PersonDetail> matchedUsers = new ArrayList<>();

            for (User user : users.values()) {
                if (matchesRequestV2(user, request)) {
                    PersonQueryV2Response.PersonDetail detail = new PersonQueryV2Response.PersonDetail();
                    detail.setPid(user.getUsername());
                    detail.setUserName(user.getUsername());
                    detail.setIdcard((String) user.getAttributes().get("idcard"));
                    detail.setOrgCode((String) user.getAttributes().get("orgCode"));
                    detail.setOrgName((String) user.getAttributes().get("orgName"));
                    detail.setPoliceNo((String) user.getAttributes().get("policeNo"));
                    detail.setPhone((String) user.getAttributes().get("phone"));
                    detail.setEmail((String) user.getAttributes().get("email"));
                    detail.setPinyin((String) user.getAttributes().get("pinyin"));
                    matchedUsers.add(detail);
                }
            }

            // 构建响应
            PersonQueryV2Response response = new PersonQueryV2Response("0000", "");
            PersonQueryV2Response.PersonResult result = new PersonQueryV2Response.PersonResult();
            result.setTotal(matchedUsers.size());

            // 分页处理
            int start = request.getStart() != null ? request.getStart() : 0;
            int size = request.getSize() != null ? request.getSize() : 1000;
            int end = Math.min(start + size, matchedUsers.size());

            if (start < matchedUsers.size()) {
                result.setRows(matchedUsers.subList(start, end));
            } else {
                result.setRows(new ArrayList<>());
            }

            response.setResult(result);
            log.info("人员信息查询成功（V2），数据量: {}", matchedUsers.size());
            return response;

        } catch (Exception e) {
            log.error("查询人员信息异常（V2）", e);
            return createPersonV2ErrorResponse("E020300D", "系统查询人员信息失败：" + e.getMessage());
        }
    }

    // createUser 已注释
    // @Override
    // public void createUser(String username, String password) {
    //     log.info("用户已存在或创建成功: {}", username);
    // }

    // 辅助方法：检查用户是否符合查询条件（V1版本）
    private boolean matchesRequest(User user, PersonQueryRequest request) {
        if (request.getIds() != null && request.getIds().contains(user.getUsername())) {
            return true;
        }
        if (request.getUserName() != null && request.getUserName().equals(user.getUsername())) {
            return true;
        }
        if (request.getIdcard() != null && request.getIdcard().equals(user.getAttributes().get("idcard"))) {
            return true;
        }
        if (request.getOrgCode() != null && request.getOrgCode().equals(user.getAttributes().get("orgCode"))) {
            return true;
        }
        if (request.getPoliceNo() != null && request.getPoliceNo().equals(user.getAttributes().get("policeNo"))) {
            return true;
        }
        return false;
    }

    // 辅助方法：检查用户是否符合查询条件（V2版本）
    private boolean matchesRequestV2(User user, PersonQueryV2Request request) {
        // ids 支持逗号分隔的多个值
        if (request.getIds() != null) {
            String[] ids = request.getIds().split(",");
            for (String id : ids) {
                if (id.trim().equals(user.getUsername())) {
                    return true;
                }
            }
        }
        if (request.getUserName() != null && request.getUserName().equals(user.getUsername())) {
            return true;
        }
        if (request.getIdcard() != null && request.getIdcard().equals(user.getAttributes().get("idcard"))) {
            return true;
        }
        // orgCode 支持逗号分隔的多个值
        if (request.getOrgCode() != null) {
            String userOrgCode = (String) user.getAttributes().get("orgCode");
            if (userOrgCode != null) {
                String[] orgCodes = request.getOrgCode().split(",");
                for (String orgCode : orgCodes) {
                    if (orgCode.trim().equals(userOrgCode)) {
                        return true;
                    }
                }
            }
        }
        if (request.getPoliceNo() != null && request.getPoliceNo().equals(user.getAttributes().get("policeNo"))) {
            return true;
        }
        // pinyin 匹配
        if (request.getPinyin() != null && request.getPinyin().equals(user.getAttributes().get("pinyin"))) {
            return true;
        }
        return false;
    }

    // 辅助方法：创建错误响应
    private UserTokenQueryResponse createErrorResponse(String status, String message) {
        return new UserTokenQueryResponse(status, message);
    }

    // 辅助方法：创建人员查询错误响应（V1版本）
    private PersonQueryResponse createPersonErrorResponse(String status, String message) {
        return new PersonQueryResponse(status, message);
    }

    // 辅助方法：创建人员查询错误响应（V2版本）
    private PersonQueryV2Response createPersonV2ErrorResponse(String status, String message) {
        return new PersonQueryV2Response(status, message);
    }

    // 辅助方法：脱敏 token
    private String maskToken(String token) {
        if (token == null || token.length() <= 6) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }

    // 辅助方法：检查是否所有字符串都为空
    private boolean isAllBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return false;
            }
        }
        return true;
    }
}
