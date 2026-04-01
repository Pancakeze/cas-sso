 package com.example.cas.controller;

 import com.example.cas.model.dto.PersonQueryV2Request;
 import com.example.cas.model.dto.PersonQueryV2Response;
 import com.example.cas.service.UserTokenService;
 import org.slf4j.Logger;
 import org.slf4j.LoggerFactory;
 import org.springframework.http.MediaType;
 import org.springframework.web.bind.annotation.*;

 import java.util.Map;

/**
 * 人员信息查询 V2 控制器
 * 接口地址: /uac/openAPI/queryPerson/v2
 */
@RestController
@RequestMapping("/uac/openAPI")
public class PersonQueryV2Controller {

    private static final Logger log = LoggerFactory.getLogger(PersonQueryV2Controller.class);

    private final UserTokenService userTokenService;

    public PersonQueryV2Controller(UserTokenService userTokenService) {
        this.userTokenService = userTokenService;
    }

    /**
     * 6.1 人员信息查询服务（V2）
     */
    @PostMapping(value = "/queryPerson/v2", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PersonQueryV2Response queryPersonV2(@RequestBody PersonQueryV2Request request) {
        log.info("收到人员信息查询请求（V2）: {}", request);
        return userTokenService.queryPersonInfoV2(request);
    }

    /**
     * 健康检查接口（V2）
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "CAS Person Query V2 Service",
                "timestamp", System.currentTimeMillis()
        );
    }
}
