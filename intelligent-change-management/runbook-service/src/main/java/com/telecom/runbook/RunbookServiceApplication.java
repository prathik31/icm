package com.telecom.runbook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RunbookServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RunbookServiceApplication.class, args);
    }
}