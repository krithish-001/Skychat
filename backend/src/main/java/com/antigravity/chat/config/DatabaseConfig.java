package com.antigravity.chat.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Senior Staff Engineer - Production Reliability Fix
 * Automatically detects and fixes database URLs that are missing the 'jdbc:' prefix.
 * This is crucial for cloud deployments like Render, Supabase, and Railway.
 */
@Configuration
public class DatabaseConfig implements BeanPostProcessor {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties) {
            DataSourceProperties properties = (DataSourceProperties) bean;
            String url = properties.getUrl();

            if (url != null && !url.trim().isEmpty()) {
                // If the URL starts with 'postgresql://', 'postgres://', 'mysql://', etc.
                // but lacks 'jdbc:', we prepends it automatically.
                if (url.startsWith("postgresql://") || 
                    url.startsWith("postgres://")) {
                    
                    String fixedUrl = "jdbc:" + url;
                    logger.info("Senior Staff Fix: Prepending 'jdbc:' to database URL.");
                    logger.debug("Original URL: {}", url);
                    logger.debug("Fixed URL: {}", fixedUrl);
                    properties.setUrl(fixedUrl);
                }
            }
        }
        return bean;
    }
}
