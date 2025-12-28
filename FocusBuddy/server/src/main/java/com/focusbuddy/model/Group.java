package com.focusbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups")
@Data
@NoArgsConstructor
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // e.g., "Deep Work", "Coding"

    @Enumerated(EnumType.STRING)
    private GroupStatus status = GroupStatus.RECRUITING;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "group_members", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<User> members = new ArrayList<>();

    public enum GroupStatus {
        RECRUITING, ACTIVE, ARCHIVED
    }
}
