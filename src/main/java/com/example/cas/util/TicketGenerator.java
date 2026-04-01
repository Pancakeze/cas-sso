package com.example.cas.util;

import java.security.SecureRandom;
import java.util.Base64;

public class TicketGenerator {
    
    private static final String TGT_PREFIX = "TGT";
    private static final String ST_PREFIX = "ST";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    public static String generateTGT() {
        return TGT_PREFIX + "-" + generateRandomString();
    }
    
    public static String generateST(String service) {
        return ST_PREFIX + "-" + generateHash(service);
    }
    
    private static String generateRandomString() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    
    private static String generateHash(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest((input + System.currentTimeMillis()).getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            return generateRandomString();
        }
    }
}
