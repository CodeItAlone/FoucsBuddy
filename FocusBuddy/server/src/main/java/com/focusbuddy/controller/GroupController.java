package com.focusbuddy.controller;

import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.model.Group;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.UserRepository;
import com.focusbuddy.service.GroupService;
import com.focusbuddy.service.GroupService.MemberStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Group>> getMyGroups(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromPrincipal(userDetails);
        return ResponseEntity.ok(groupService.getUserGroups(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @GetMapping("/{id}/members/status")
    public ResponseEntity<List<MemberStatus>> getMemberStatuses(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupMemberStatuses(id));
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateGroupRequest request) {

        User user = getUserFromPrincipal(userDetails);
        Group group = groupService.createGroup(user.getId(), request.getName(), request.getCategory());
        return ResponseEntity.ok(group);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Group> joinGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUserFromPrincipal(userDetails);
        return ResponseEntity.ok(groupService.joinGroup(user.getId(), id));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUserFromPrincipal(userDetails);
        groupService.leaveGroup(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromPrincipal(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Data
    static class CreateGroupRequest {
        @NotBlank(message = "Group name is required")
        private String name;

        @NotBlank(message = "Category is required")
        private String category;
    }
}
