package com.careconnect.service;

import com.careconnect.dto.ChatDtos;
import com.careconnect.entity.*;
import com.careconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final MedicalStaffRepository medicalStaffRepository;
    private final RequestAcceptanceRepository requestAcceptanceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatRoomRepository chatRoomRepository,
                       ChatMessageRepository chatMessageRepository,
                       EmergencyRequestRepository emergencyRequestRepository,
                       UserRepository userRepository,
                       HospitalRepository hospitalRepository,
                       MedicalStaffRepository medicalStaffRepository,
                       RequestAcceptanceRepository requestAcceptanceRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.emergencyRequestRepository = emergencyRequestRepository;
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.medicalStaffRepository = medicalStaffRepository;
        this.requestAcceptanceRepository = requestAcceptanceRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ChatDtos.ChatMessageDto saveMessage(Long senderUserId, ChatDtos.ChatMessageRequest request) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        EmergencyRequest emergencyRequest = emergencyRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        ChatRoom room = chatRoomRepository.findByRequest(emergencyRequest)
                .orElseGet(() -> {
                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setRequest(emergencyRequest);
                    return chatRoomRepository.save(newRoom);
                });

        ChatMessage message = new ChatMessage();
        message.setRoom(room);
        message.setSender(sender);
        message.setMessage(request.getContent());
        message.setParticipantUserId(resolveParticipantUserIdForThread(sender, emergencyRequest, request.getParticipantUserId()));
        chatMessageRepository.save(message);

        ChatDtos.ChatMessageDto dto = toMessageDto(message, emergencyRequest.getId(), room.getId());

        // Broadcast to participant-specific WebSocket topic (true one-to-one thread).
        String topic = "/topic/requests/" + emergencyRequest.getId() + "/chat/" + dto.getParticipantUserId();
        log.info("Broadcasting chat message id={} to {}", dto.getId(), topic);
        messagingTemplate.convertAndSend(topic, dto);

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<ChatDtos.ChatMessageDto> getMessagesForRequest(Long userId, Long requestId, Long participantUserId, int page, int size) {
        User viewer = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        EmergencyRequest emergencyRequest = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        ChatRoom room = chatRoomRepository.findByRequest(emergencyRequest)
                .orElseThrow(() -> new IllegalArgumentException("Chat room not found for request"));

        Long threadParticipantUserId = resolveParticipantUserIdForThread(viewer, emergencyRequest, participantUserId);

        List<ChatMessage> visibleMessages = chatMessageRepository
                .findByRoomAndParticipantUserIdOrderBySentAtAsc(room, threadParticipantUserId);

        int from = Math.min(page * size, visibleMessages.size());
        int to = Math.min(from + size, visibleMessages.size());
        List<ChatDtos.ChatMessageDto> dtos = visibleMessages.subList(from, to).stream()
                .map(message -> toMessageDto(message, emergencyRequest.getId(), room.getId()))
                .toList();

        return new PageImpl<>(dtos, PageRequest.of(page, size), visibleMessages.size());
    }

    @Transactional(readOnly = true)
    public List<ChatDtos.ConversationDto> getConversations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        var hospitalOpt = hospitalRepository.findByUser(user);
        List<ChatDtos.ConversationDto> conversations = new ArrayList<>();

        if (hospitalOpt.isPresent()) {
            Hospital hospital = hospitalOpt.get();
            List<EmergencyRequest> requests = emergencyRequestRepository.findByHospital(hospital);
            for (EmergencyRequest req : requests) {
                Optional<ChatRoom> roomOpt = chatRoomRepository.findByRequest(req);
                List<RequestAcceptance> accepted = requestAcceptanceRepository
                        .findByRequestAndStatusWithStaffUser(req, AcceptanceStatus.ACCEPTED);
                for (RequestAcceptance acceptance : accepted) {
                    Long threadParticipantUserId = acceptance.getStaff().getUser().getId();
                    ChatDtos.ConversationDto conv = buildConversationForThread(
                            req,
                            roomOpt.orElse(null),
                            threadParticipantUserId,
                            acceptance.getStaff().getUser().getFullName()
                    );
                    conversations.add(conv);
                }
            }
        } else {
            List<EmergencyRequest> acceptedRequests = requestAcceptanceRepository
                    .findAcceptedRequestsByStaffUserId(userId, AcceptanceStatus.ACCEPTED);
            for (EmergencyRequest req : acceptedRequests) {
                Optional<ChatRoom> roomOpt = chatRoomRepository.findByRequest(req);
                ChatDtos.ConversationDto conv = buildConversationForThread(
                        req,
                        roomOpt.orElse(null),
                        userId,
                        req.getHospital().getName()
                );
                conversations.add(conv);
            }
        }

        conversations.sort(Comparator
                .comparing(ChatDtos.ConversationDto::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(ChatDtos.ConversationDto::getRequestId, Comparator.reverseOrder()));

        return conversations;
    }

    private ChatDtos.ChatMessageDto toMessageDto(ChatMessage message, Long requestId, Long roomId) {
        ChatDtos.ChatMessageDto dto = new ChatDtos.ChatMessageDto();
        dto.setId(message.getId());
        dto.setRequestId(requestId);
        dto.setRoomId(roomId);
        dto.setSenderUserId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderRole(message.getSender().getRole().name());
        dto.setParticipantUserId(message.getParticipantUserId());
        dto.setContent(message.getMessage());
        dto.setSentAt(message.getSentAt());
        return dto;
    }

    private Long resolveParticipantUserIdForThread(User user, EmergencyRequest request, Long requestedParticipantUserId) {
        Long hospitalUserId = request.getHospital().getUser().getId();

        if (hospitalUserId.equals(user.getId())) {
            if (requestedParticipantUserId == null) {
                throw new IllegalArgumentException("participantUserId is required for hospital chat");
            }
            boolean isAcceptedStaffForRequest = requestAcceptanceRepository
                    .findByRequestAndStatusWithStaffUser(request, AcceptanceStatus.ACCEPTED)
                    .stream()
                    .anyMatch(ra -> ra.getStaff().getUser().getId().equals(requestedParticipantUserId));
            if (!isAcceptedStaffForRequest) {
                throw new IllegalArgumentException("Selected staff is not accepted for this request");
            }
            return requestedParticipantUserId;
        }

        MedicalStaff staff = medicalStaffRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Only accepted staff can access request chat"));
        boolean accepted = requestAcceptanceRepository
                .existsByRequestAndStaffAndStatus(request, staff, AcceptanceStatus.ACCEPTED);
        if (!accepted) {
            throw new IllegalArgumentException("You have not accepted this request");
        }
        return user.getId();
    }

    private ChatDtos.ConversationDto buildConversationForThread(
            EmergencyRequest req,
            ChatRoom room,
            Long participantUserId,
            String otherPartyName) {
        ChatDtos.ConversationDto conv = new ChatDtos.ConversationDto();
        conv.setRequestId(req.getId());
        conv.setRoomId(room != null ? room.getId() : null);
        conv.setParticipantUserId(participantUserId);
        conv.setRequestTitle(req.getTitle());
        conv.setOtherPartyName(otherPartyName);

        if (room != null) {
            chatMessageRepository.findTopByRoomAndParticipantUserIdOrderBySentAtDesc(room, participantUserId)
                    .ifPresent(lastMsg -> {
                        conv.setLastMessage(lastMsg.getMessage());
                        conv.setLastMessageAt(lastMsg.getSentAt());
                    });
        }
        return conv;
    }
}
