package com.telecom.change_request_service.mapper;

import com.telecom.change_request_service.dto.event.ChangeRequestEvent;
import com.telecom.change_request_service.entity.ChangeRequest;
import com.telecom.change_request_service.entity.CrAsset;
import com.telecom.change_request_service.repository.CrAssetRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ChangeRequestEventMapper {

    private final CrAssetRepository crAssetRepository;

    private static final DateTimeFormatter ISO =
        DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public ChangeRequestEvent toEvent(

        ChangeRequest entity
    ) {

        ChangeRequestEvent event =
            new ChangeRequestEvent();

        event.setCrId(
            entity.getCrId()
        );

        event.setTitle(
            entity.getTitle()
        );

        event.setDescription(
            entity.getDescription()
        );

        event.setDomain(
            entity.getDomain()
        );

        event.setChangeType(
            entity.getChangeType()
        );

        event.setRegion(
            entity.getRegion()
        );

        event.setScheduledStart(
            formatDateTime(
                entity.getScheduledStart()
            )
        );

        event.setScheduledEnd(
            formatDateTime(
                entity.getScheduledEnd()
            )
        );

        event.setRollbackAvailable(
            entity.getRollbackAvailable()
        );

        event.setBusinessJustification(
            entity.getBusinessJustification()
        );

        List<CrAsset> assets =
            crAssetRepository.findByCrId(
                entity.getCrId()
            );

        event.setAssetCount(

            assets != null
                ? assets.size()
                : 0
        );

        event.setAssetIds(

            assets != null

                ? assets.stream()

                    .map(CrAsset::getAssetId)

                    .collect(Collectors.toList())

                : List.of()
        );

        event.setDurationMinutes(

            calculateDurationMinutes(

                entity.getScheduledStart(),

                entity.getScheduledEnd()
            )
        );

        event.setIsWeekend(

            isWeekend(
                entity.getScheduledStart()
            )
        );

        event.setIsPeakHours(

            isPeakHours(
                entity.getScheduledStart()
            )
        );

        return event;
    }

    private String formatDateTime(

        LocalDateTime dt
    ) {

        return dt != null
            ? dt.format(ISO)
            : null;
    }

    private Integer calculateDurationMinutes(

        LocalDateTime start,

        LocalDateTime end
    ) {

        if (
            start == null ||
            end == null
        ) {

            return 0;
        }

        return (int)

            Duration

                .between(start, end)

                .toMinutes();
    }

    private Boolean isWeekend(

        LocalDateTime dt
    ) {

        if (dt == null) {
            return false;
        }

        DayOfWeek day =
            dt.getDayOfWeek();

        return day == DayOfWeek.SATURDAY
            || day == DayOfWeek.SUNDAY;
    }

    private Boolean isPeakHours(

        LocalDateTime dt
    ) {

        if (dt == null) {
            return false;
        }

        LocalTime time =
            dt.toLocalTime();

        return time.isAfter(
                    LocalTime.of(9, 0)
               )
            &&
               time.isBefore(
                    LocalTime.of(18, 0)
               );
    }
}
