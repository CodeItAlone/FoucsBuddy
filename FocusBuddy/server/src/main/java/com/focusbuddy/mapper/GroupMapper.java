package com.focusbuddy.mapper;

import com.focusbuddy.dto.response.GroupResponse;
import com.focusbuddy.dto.response.GroupResponse.GroupMemberResponse;
import com.focusbuddy.model.Group;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GroupMapper {

    public GroupResponse toResponse(Group group) {
        List<GroupMemberResponse> members = group.getMembers().stream()
                .map(user -> new GroupMemberResponse(user.getId(), user.getHandle()))
                .toList();

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getCategory(),
                group.getStatus().name(),
                members);
    }

    public List<GroupResponse> toResponseList(List<Group> groups) {
        return groups.stream()
                .map(this::toResponse)
                .toList();
    }
}
