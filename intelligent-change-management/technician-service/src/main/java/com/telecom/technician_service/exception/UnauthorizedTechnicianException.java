package com.telecom.technician_service.exception;

public class UnauthorizedTechnicianException extends RuntimeException {
    public UnauthorizedTechnicianException(String message) {
        super(message);
    }
}
