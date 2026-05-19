package com.careconnect.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.careconnect.util.PhoneNumberUtil;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    @Value("${careconnect.twilio.account-sid:}")
    private String accountSid;

    @Value("${careconnect.twilio.auth-token:}")
    private String authToken;

    @Value("${careconnect.twilio.from-number:}")
    private String fromNumber;

    @Value("${careconnect.twilio.messaging-service-sid:}")
    private String messagingServiceSid;

    private boolean configured = false;

    @PostConstruct
    public void init() {
        boolean hasAccount = accountSid != null && !accountSid.isBlank();
        boolean hasToken = authToken != null && !authToken.isBlank();
        boolean hasFromNumber = fromNumber != null && !fromNumber.isBlank();
        boolean hasMessagingServiceSid = messagingServiceSid != null && !messagingServiceSid.isBlank();

        if (hasAccount && hasToken && (hasFromNumber || hasMessagingServiceSid)) {
            Twilio.init(accountSid, authToken);
            configured = true;
            log.info("Twilio SMS service initialized successfully");
        } else {
            log.warn("Twilio SMS not configured (missing account-sid/auth-token and from-number or messaging-service-sid). "
                    + "SMS notifications will be logged but not sent.");
        }
    }

    /**
     * Send an SMS to the given phone number.
     * Runs async to not block the request thread.
     * If Twilio is not configured, it logs the message instead.
     */
    @Async("taskExecutor")
    public void sendSms(String toNumber, String messageBody) {
        if (toNumber == null || toNumber.isBlank()) {
            log.debug("Skipping SMS — no phone number provided");
            return;
        }

        String normalizedTo = PhoneNumberUtil.normalizeToE164OrNull(toNumber);
        if (normalizedTo == null) {
            log.warn("Skipping SMS — invalid phone number format: {}", toNumber);
            return;
        }

        if (!configured) {
            log.info("[SMS-DRY-RUN] To: {} | Message: {}", normalizedTo, messageBody);
            return;
        }

        try {
            Message msg;
            if (messagingServiceSid != null && !messagingServiceSid.isBlank()) {
                msg = Message.creator(
                        new PhoneNumber(normalizedTo),
                        messagingServiceSid,
                        messageBody
                ).create();
            } else {
                msg = Message.creator(
                        new PhoneNumber(normalizedTo),
                        new PhoneNumber(fromNumber),
                        messageBody
                ).create();
            }

            log.info("SMS sent to {} | SID: {} | Status: {}", normalizedTo, msg.getSid(), msg.getStatus());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", normalizedTo, e.getMessage(), e);
        }
    }
}
