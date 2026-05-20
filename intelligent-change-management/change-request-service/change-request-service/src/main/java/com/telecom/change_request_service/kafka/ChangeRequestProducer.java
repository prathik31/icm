package com.telecom.change_request_service.kafka;

import com.telecom.change_request_service.dto.event.ChangeRequestEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.kafka.core.KafkaTemplate;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChangeRequestProducer {

    private final KafkaTemplate<
        String,
        ChangeRequestEvent
    > kafkaTemplate;

    @Value(
        "${app.kafka.change-request-topic:change-requests}"
    )
    private String topic;

    public void publishChangeRequest(

        ChangeRequestEvent event
    ) {

        kafkaTemplate.send(

            topic,

            event
        ).whenComplete(

            (result, ex) -> {

                if (ex != null) {

                    log.error(

                        "Failed to publish Change Request Event: {}",

                        event.getCrId(),

                        ex
                    );

                } else {

                    log.info(

                        "Published Change Request Event: {}",

                        event.getCrId()
                    );
                }
            }
        );
    }
}
