package com.telecom.runbook.exception;

public class RunbookNotFoundException extends RuntimeException {

    public RunbookNotFoundException(String message) {
        super(message);
    }
}