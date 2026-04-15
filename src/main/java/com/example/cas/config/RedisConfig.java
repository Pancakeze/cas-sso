package com.example.cas.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

/**
 * Redis 配置
 * 当 Redis 连接可用时自动生效；本地开发无 Redis 时跳过
 */
@Configuration
@ConditionalOnClass(RedisConnectionFactory.class)
public class RedisConfig {

    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // key 使用 String 序列化
        template.setKeySerializer(org.springframework.data.redis.serializer.StringRedisSerializer.UTF_8);
        template.setHashKeySerializer(org.springframework.data.redis.serializer.StringRedisSerializer.UTF_8);

        // value 使用 String 序列化（保持兼容，避免 Jackson 类型前缀问题）
        org.springframework.data.redis.serializer.StringRedisSerializer stringSerializer =
                org.springframework.data.redis.serializer.StringRedisSerializer.UTF_8;
        template.setValueSerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
