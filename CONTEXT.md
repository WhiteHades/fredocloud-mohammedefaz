# notFredoHub

notFredoHub is a collaborative team hub for planning work inside shared workspaces. It exists to keep goals, announcements, action items, notifications, and audit history in one place without splitting the team across separate tools.

## Language

**User**:
A registered person who can authenticate and belong to one or more Workspaces.
_Avoid_: Account, profile

**Workspace**:
The top-level collaboration space that contains Members, Goals, Announcements, Action Items, Notifications, and Audit Events.
_Avoid_: Team, organisation, project

**Membership**:
The relationship between a User and a Workspace, including role and invitation state.
_Avoid_: Access record, join row

**Role**:
The default authority level a Member holds inside a Workspace, starting as Admin or Member.
_Avoid_: Rank, type

**Permission**:
An action-level rule that decides whether a Member may perform a specific Workspace operation.
_Avoid_: Capability flag, privilege bit

**Goal**:
A top-level outcome owned by a Member and tracked with status, due date, Milestones, and Progress Updates.
_Avoid_: Objective, epic

**Milestone**:
A nested checkpoint under a Goal with its own progress percentage.
_Avoid_: Sub-goal, step

**Progress Update**:
A feed entry that records movement or commentary on a Goal.
_Avoid_: Note, log line

**Announcement**:
A workspace-wide rich-text post published by an Admin and open to reactions, comments, and pinning.
_Avoid_: Broadcast, notice

**Action Item**:
A tracked unit of work with assignee, priority, due date, status, and an optional parent Goal.
_Avoid_: Task card, todo

**Comment**:
A discussion reply attached to an Announcement or other feed surface and able to contain Mentions.
_Avoid_: Reply object, message

**Mention**:
An explicit reference to a teammate inside a Comment that triggers an in-app Notification and, when configured, an email.
_Avoid_: Tag, ping

**Notification**:
A user-facing alert created by invites, Mentions, or other important workspace events.
_Avoid_: Alert row, event message

**Presence**:
The live online state of a Member within a Workspace.
_Avoid_: Session flag, socket count

**Audit Event**:
An immutable record of a Workspace change, including actor, action, target, and timestamp.
_Avoid_: Log entry, history row

## Relationships

- A **User** can hold many **Memberships** across multiple **Workspaces**.
- A **Workspace** contains many **Memberships**, **Goals**, **Announcements**, **Action Items**, **Notifications**, and **Audit Events**.
- A **Membership** grants a **Role** and resolves into one or more **Permissions**.
- A **Goal** belongs to one **Workspace**, has one owner **Membership**, and may contain many **Milestones** and **Progress Updates**.
- An **Action Item** belongs to one **Workspace** and may link to one parent **Goal**.
- An **Announcement** belongs to one **Workspace** and may have many **Comments** and reactions.
- A **Mention** inside a **Comment** creates a **Notification** for the mentioned **User** within the relevant **Workspace**.
- Every privileged or state-changing action produces an **Audit Event**.

## Example Dialogue

> **Dev:** "If a User belongs to two Workspaces, do they become two Members?"
> **Domain expert:** "They stay one User, but they hold two Memberships, and each Membership can carry a different Role and Permission set."

## Flagged Ambiguities

- "member" can mean the person or the relationship. Resolved: **User** is the person, **Membership** is the workspace relationship, and **Member** is informal shorthand for a User viewed through a Membership.
- "activity feed" and "audit log" sound similar but are not the same. Resolved: **Progress Updates** and social activity are user-facing collaboration surfaces, while **Audit Events** are immutable operational records.
