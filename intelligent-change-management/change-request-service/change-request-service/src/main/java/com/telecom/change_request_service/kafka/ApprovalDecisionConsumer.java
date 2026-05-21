package com.telecom.change_request_service.kafka;

import com.telecom.change_request_service.entity.ChangeRequest;
import com.telecom.change_request_service.enums.Status;
import com.telecom.change_request_service.repository.ChangeRequestRepository;
import com.telecom.change_request_service.kafka.event.ApprovalDecisionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalDecisionConsumer {

    private final ChangeRequestRepository changeRequestRepository;

    @KafkaListener(
            topics = "cr.approved",
            groupId = "change-request-service-v2"
    )
    public void consumeApproved(ApprovalDecisionEvent event) {

        log.info("Received APPROVED event for CR: {}", event.getCrId());

        Optional<ChangeRequest> maybeChangeRequest =
                changeRequestRepository.findById(event.getCrId());

        if (maybeChangeRequest.isPresent()) {

            ChangeRequest changeRequest = maybeChangeRequest.get();

            changeRequest.setStatus(Status.APPROVED);
            changeRequest.setUpdatedAt(LocalDateTime.now());

            changeRequestRepository.save(changeRequest);

            log.info("CR {} status updated to APPROVED", event.getCrId());

        } else {

            log.warn("CR {} not found for APPROVED event", event.getCrId());
        }
    }

    @KafkaListener(
            topics = "cr.rejected",
            groupId = "change-request-service-v2"
    )
    public void consumeRejected(ApprovalDecisionEvent event) {

        log.info("Received REJECTED event for CR: {}", event.getCrId());

        Optional<ChangeRequest> maybeChangeRequest =
                changeRequestRepository.findById(event.getCrId());

        if (maybeChangeRequest.isPresent()) {

            ChangeRequest changeRequest = maybeChangeRequest.get();

            changeRequest.setStatus(Status.REJECTED);
            changeRequest.setUpdatedAt(LocalDateTime.now());

            changeRequestRepository.save(changeRequest);

            log.info("CR {} status updated to REJECTED", event.getCrId());

        } else {

            log.warn("CR {} not found for REJECTED event", event.getCrId());
        }
    }
}
