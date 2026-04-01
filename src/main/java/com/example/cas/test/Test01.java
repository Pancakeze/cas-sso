package com.example.cas.test;


import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class Test01 {


    public static void main(String[] args) throws Exception {
        String noPasswordAesKey= "noPasswordAesKey";
        String noPasswordAesIv ="_noPasswordAesIv";
        String encryptedText = "r5zbmpcpoSUhr46nQu0UQlgsthD21IFAYmB%2BE%2BGf5owN50dU63XIdmldZ3vyxcTz53uG1QlWgrQjz0MuW4x2les6iyueqwcr9jLHiQNJokVKvxF7RD8ITPFXIeXBNkm";
        encryptedText = URLDecoder.decode(encryptedText, "UTF-8");
        String text = decrypt(encryptedText, noPasswordAesKey, noPasswordAesIv);
        System.out.println(text);
//        long current = System.currentTimeMillis();
    }

    public static String decrypt(String encryptedText, String key, String iv) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedText);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}
