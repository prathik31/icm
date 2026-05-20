package com.telecom.change_request_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseConstraintInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConstraintInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initialize() {
        dropForeignKeysForTable("change_requests");
        dropForeignKeysForTable("cr_audit_logs");
    }

    private void dropForeignKeysForTable(String tableName) {
        try {
            // Check for foreign key constraints on the table
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS " +
                    "WHERE CONSTRAINT_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = ? " +
                    "AND CONSTRAINT_TYPE = 'FOREIGN KEY'",
                    Integer.class, tableName
            );

            if (count != null && count > 0) {
                logger.info("Found {} foreign key constraints on {} table", count, tableName);

                // Get constraint names and drop them
                jdbcTemplate.query(
                    "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS " +
                    "WHERE CONSTRAINT_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = ? " +
                    "AND CONSTRAINT_TYPE = 'FOREIGN KEY'",
                    (rs, rowNum) -> rs.getString("CONSTRAINT_NAME"), tableName
                ).forEach(constraintName -> {
                    try {
                        jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP FOREIGN KEY " + constraintName);
                        logger.info("Dropped foreign key constraint: {} on table {}", constraintName, tableName);
                    } catch (Exception e) {
                        logger.warn("Failed to drop constraint {} on table {}: {}", constraintName, tableName, e.getMessage());
                    }
                });
            } else {
                logger.info("No foreign key constraints found on {} table", tableName);
            }
        } catch (Exception ex) {
            logger.error("Error processing constraints for table {}: {}", tableName, ex.getMessage());
        }
    }
}
