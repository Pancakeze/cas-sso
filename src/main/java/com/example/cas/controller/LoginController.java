package com.example.cas.controller;

import com.example.cas.model.TicketGrantingTicket;
import com.example.cas.model.User;
import com.example.cas.service.AuthenticationService;
import com.example.cas.service.TicketService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/cas")
public class LoginController {
    
    private final AuthenticationService authService;
    private final TicketService ticketService;
    
    private static final String COOKIE_NAME = "CASTGC";
    
    @Value("${cas.cookie.name:CASTGC}")
    private String cookieName;
    
    public LoginController(AuthenticationService authService, TicketService ticketService) {
        this.authService = authService;
        this.ticketService = ticketService;
    }
    
    @GetMapping("/login")
    public String login(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String ticket,
            @CookieValue(value = COOKIE_NAME, required = false) String castgc,
            Model model) {
        
        if (ticket != null && service != null) {
            return "redirect:/cas/serviceValidate?service=" + URLEncoder.encode(service, StandardCharsets.UTF_8) + "&ticket=" + ticket;
        }
        
        if (castgc != null) {
            var tgt = ticketService.getTGT(castgc);
            if (tgt.isPresent() && !tgt.get().isExpired()) {
                if (service != null) {
                    // 已登录用户需要创建 ST 而不是传递 TGT
                    var st = ticketService.createST(service, tgt.get());
                    return "redirect:" + service + "?ticket=" + st.getId();
                }
                model.addAttribute("username", tgt.get().getUsername());
                return "loggedIn";
            }
        }
        
        model.addAttribute("service", service);
        return "login";
    }
    
    @PostMapping("/login")
    public String loginSubmit(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(required = false) String service,
            HttpServletResponse response,
            Model model) {
        
        User user = authService.authenticate(username, password);
        
        if (user == null) {
            model.addAttribute("error", "Invalid username or password");
            model.addAttribute("service", service);
            return "login";
        }
        
        TicketGrantingTicket tgt = ticketService.createTGT(username);
        
        Cookie cookie = new Cookie(cookieName, tgt.getId());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
        
        if (service != null) {
            return "redirect:" + service + "?ticket=" + ticketService.createST(service, tgt).getId();
        }
        
        model.addAttribute("username", username);
        return "loggedIn";
    }
    
    @GetMapping("/logout")
    public String logout(
            @CookieValue(value = COOKIE_NAME, required = false) String castgc,
            @RequestParam(required = false) String service,
            HttpServletResponse response) {
        
        if (castgc != null) {
            ticketService.deleteTGT(castgc);
        }
        
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        
        return service != null ? "redirect:" + service : "redirect:/cas/login";
    }
}
