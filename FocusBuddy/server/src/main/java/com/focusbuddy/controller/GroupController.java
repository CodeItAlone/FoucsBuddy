package com.focusbuddy.controller;

import com.focusbuddy.dto.request.CreateGroupRequest;
import com.focusbuddy.dto.response.GroupResponse;
import com.focusbuddy.dto.response.MemberStatusResponse;
import com.focusbuddy.mapper.GroupMapper;
import com.focusbuddy.model.Group;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.GroupService;
import jakarta.validation.Valid;
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
    private final GroupMapper groupMapper;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        List<Group> groups = groupService.getUserGroups(userId);
        return ResponseEntity.ok(groupMapper.toResponseList(groups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroup(@PathVariable Long id) {
        Group group = groupService.getGroupById(id);
        return ResponseEntity.ok(groupMapper.toResponse(group));
    }

    @GetMapping("/{id}/members/status")
    public ResponseEntity<List<MemberStatusResponse>> getMemberStatuses(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupMemberStatuses(id));
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateGroupRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Group group = groupService.createGroup(userId, request.name(), request.category());
        return ResponseEntity.ok(groupMapper.toResponse(group));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<GroupResponse> joinGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        Group group = groupService.joinGroup(userId, id);
        return ResponseEntity.ok(groupMapper.toResponse(group));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        groupService.leaveGroup(userId, id);
        return ResponseEntity.noContent().build();
    }
}
