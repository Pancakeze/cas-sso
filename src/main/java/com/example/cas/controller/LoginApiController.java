// package com.example.cas.controller;

// import com.example.cas.model.User;
// import com.example.cas.service.AuthenticationService;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;

/**
 * 登录 API 控制器 - 已注释，与CAS登录流程重复
 */
// @RestController
// @RequestMapping("/api")
// public class LoginApiController {

//     private final AuthenticationService authService;

//     public LoginApiController(AuthenticationService authService) {
//         this.authService = authService;
//     }

//     /**
//      * 登录并返回 userToken
//      */
//     @PostMapping("/login")
//     public Map<String, Object> login(@RequestParam String username, @RequestParam String password) {
//         User user = authService.authenticate(username, password);
        
//         if (user == null) {
//             return Map.of("success", false, "message", "用户名或密码错误");
//         }
        
//         // 获取该用户的 userToken
//         var userOpt = authService.getUserByUsername(username);
//         if (userOpt.isPresent()) {
//             User authenticatedUser = userOpt.get();
//             return Map.of(
//                 "success", true,
//                 "username", username,
//                 "userToken", authenticatedUser.getUserToken() != null ? authenticatedUser.getUserToken() : ""
//             );
//         }
        
//         return Map.of("success", false, "message", "登录失败");
//     }
// }
