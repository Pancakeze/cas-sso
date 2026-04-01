package com.example.cas.controller;

import com.example.cas.service.AuthenticationService;
import com.example.cas.service.TicketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/cas")
public class ValidateController {

    private static final Logger log = LoggerFactory.getLogger(ValidateController.class);

    private final TicketService ticketService;
    private final AuthenticationService authService;

    public ValidateController(TicketService ticketService, AuthenticationService authService) {
        this.ticketService = ticketService;
        this.authService = authService;
    }

    /**
     * 检查两个 service URL 是否匹配
     * 支持：
     * - localhost/127.0.0.1 互换
     * - http/https scheme 互换（内部通信场景）
     */
    private boolean isServiceMatch(String registeredService, String requestedService) {
        if (registeredService == null || requestedService == null) {
            return false;
        }
        // 完全匹配
        if (registeredService.equals(requestedService)) {
            return true;
        }
        try {
            URI reg = new URI(registeredService);
            URI req = new URI(requestedService);
            // 比较 port、path
            boolean portMatch = reg.getPort() == req.getPort();
            boolean pathMatch = reg.getPath() != null && reg.getPath().equals(req.getPath());
            // hostname 宽松匹配：localhost 和 127.0.0.1 视为相同
            String regHost = reg.getHost();
            String reqHost = req.getHost();
            boolean hostMatch = regHost != null && reqHost != null && (
                    regHost.equals(reqHost) ||
                    ("localhost".equals(regHost) && "127.0.0.1".equals(reqHost)) ||
                    ("127.0.0.1".equals(regHost) && "localhost".equals(reqHost)));
            // scheme 宽松匹配：http/https 视为相同（内部通信场景）
            String regScheme = reg.getScheme();
            String reqScheme = req.getScheme();
            boolean schemeMatch = regScheme != null && reqScheme != null && (
                    regScheme.equals(reqScheme) ||
                    ("http".equals(regScheme) && "https".equals(reqScheme)) ||
                    ("https".equals(regScheme) && "http".equals(reqScheme)));
            return schemeMatch && hostMatch && portMatch && pathMatch;
        } catch (URISyntaxException e) {
            log.warn("Service URL 解析失败: registered={}, requested={}", registeredService, requestedService);
            return false;
        }
    }

    @GetMapping(value = "/validate", produces = MediaType.TEXT_PLAIN_VALUE)
    public String validate(@RequestParam String service, @RequestParam String ticket) {
        var stOpt = ticketService.consumeST(ticket);
        if (stOpt.isPresent() && !stOpt.get().isExpired() && isServiceMatch(stOpt.get().getService(), service)) {
            return "yes\n" + stOpt.get().getUsername() + "\n";
        }
        return "no\n\n";
    }

    /**
     * CAS 2.0 服务验证接口
     * 返回 XML 格式的认证结果，包含 userToken（JWT）
     */
    @GetMapping(value = "/serviceValidate", produces = MediaType.APPLICATION_XML_VALUE)
    public String serviceValidate(@RequestParam String service, @RequestParam String ticket) {
        var stOpt = ticketService.consumeST(ticket);
        if (stOpt.isPresent() && !stOpt.get().isExpired() && isServiceMatch(stOpt.get().getService(), service)) {
            String username = stOpt.get().getUsername();

            // 生成 JWT userToken 并存入 Redis
            String userToken = authService.storeUserToken(username);

            log.info("用户 {} 登录成功，生成 JWT userToken", username);

            return "<?xml version=\"1.0\"?>\n" +
                    "<cas:serviceResponse xmlns:cas=\"http://www.yale.edu/tp/cas\">\n" +
                    "  <cas:authenticationSuccess>\n" +
                    "    <cas:user>" + username + "</cas:user>\n" +
                    "    <cas:attributes>\n" +
                    "      <cas:userToken>" + userToken + "</cas:userToken>\n" +
                    "    </cas:attributes>\n" +
                    "  </cas:authenticationSuccess>\n" +
                    "</cas:serviceResponse>";
        }
        return "<?xml version=\"1.0\"?>\n" +
                "<cas:serviceResponse xmlns:cas=\"http://www.yale.edu/tp/cas\">\n" +
                "  <cas:authenticationFailure code=\"INVALID_TICKET\">Invalid ticket</cas:authenticationFailure>\n" +
                "</cas:serviceResponse>";
    }
}
