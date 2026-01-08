package com.focusbuddy.service;

import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.Group;
import com.focusbuddy.model.Group.GroupStatus;
import com.focusbuddy.model.Session;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.GroupRepository;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    public List<Group> getUserGroups(Long userId) {
        return groupRepository.findByMemberId(userId);
    }

    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }

    @Transactional
    public Group createGroup(Long userId, String name, String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = new Group();
        group.setName(name);
        group.setCategory(category);
        group.setStatus(GroupStatus.RECRUITING);
        group.getMembers().add(user);

        return groupRepository.save(group);
    }

    @Transactional
    public Group joinGroup(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (group.getMembers().contains(user)) {
            throw new IllegalStateException("User is already a member of this group");
        }

        group.getMembers().add(user);
        return groupRepository.save(group);
    }

    @Transactional
    public void leaveGroup(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getMembers().contains(user)) {
            throw new IllegalStateException("User is not a member of this group");
        }

        group.getMembers().remove(user);
        groupRepository.save(group);
    }

    public List<MemberStatus> getGroupMemberStatuses(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        return group.getMembers().stream()
                .map(this::getMemberStatus)
                .collect(Collectors.toList());
    }

    private MemberStatus getMemberStatus(User user) {
        var activeSession = sessionRepository.findByUserIdAndStatus(
                user.getId(), Session.SessionStatus.ACTIVE);

        String status;
        String currentTask = null;
        Integer timeLeft = null;

        if (activeSession.isPresent()) {
            Session session = activeSession.get();
            status = "DEEP_WORK";
            currentTask = session.getTaskDescription();

            long elapsed = java.time.Duration.between(
                    session.getStartedAt(), java.time.LocalDateTime.now()).toMinutes();
            timeLeft = Math.max(0, session.getPlannedDuration() - (int) elapsed);
        } else {
            status = "IDLE";
        }

        return new MemberStatus(
                user.getId(),
                user.getHandle(),
                status,
                currentTask,
                timeLeft);
    }

    // DTO for member status
    public record MemberStatus(
            Long userId,
            String handle,
            String status,
            String currentTask,
            Integer timeLeftMinutes) {
    }
}
