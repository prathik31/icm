package com.telecom.change_request_service.dto;

import com.telecom.change_request_service.enums.Status;

import lombok.Data;

@Data
public class SubmitChangeRequestResponseDTO {

    private String crId;
    private Status status;
}