# Component System

## Philosophy

Components are reusable building blocks.

Never design a new component when an existing one can solve the problem.

Consistency is more important than originality.

---

# Component Hierarchy

Foundation

↓

Layout

↓

Components

↓

Patterns

↓

Screens

Never skip this hierarchy.

---

# Button

Purpose

Primary user action.

Examples

- Play
- Continue
- Retry
- Save

Rules

Only ONE primary button should exist within one section.

Primary buttons should always attract attention first.

Never place two primary buttons side by side.

---

## Secondary Button

Purpose

Supporting actions.

Examples

Back

Cancel

Skip

Settings

Secondary buttons should never compete with Primary.

---

## Ghost Button

Purpose

Low priority actions.

Examples

Learn More

View Details

History

---

## Icon Button

Purpose

Compact actions.

Examples

Settings

Notification

Sound

Profile

Rules

Always use recognizable icons.

Never rely on icon only for destructive actions.

---

# Card

Purpose

Display information.

Cards are containers.

Not decoration.

---

Every card should contain

Title

Optional Description

Optional Metadata

Primary Action

---

Cards should never become dashboards.

Keep them focused.

---

# Game Card

Contains

Game Icon

Game Name

Short Description

Best Score

Difficulty

Play Button

Optional

Progress

Completion

---

# Player Card

Contains

Avatar

Username

Level

Rating

Optional

Daily Streak

---

# Achievement Card

Contains

Badge

Title

Description

Unlocked Time

---

# Statistic Card

Contains

One Metric

One Label

Optional Trend

Never display more than one important number.

---

# Input

Purpose

Collect user information.

Keep labels outside.

Never use placeholder as label.

---

Supported Inputs

Text

Email

Password

Search

Number

---

# Search Bar

Always place near the top.

Never hide search unless necessary.

---

# Dialog

Purpose

Interrupt user only when necessary.

Examples

Exit Game

Delete Account

Connection Lost

---

Dialogs should contain

Title

Description

Primary Action

Secondary Action

---

# Toast

Purpose

Temporary feedback.

Examples

Achievement unlocked

Friend online

Settings saved

Never block gameplay.

---

# Bottom Navigation

Contains only primary destinations.

Maximum

5 tabs

Recommended

4 tabs

Never place gameplay inside More menu.

---

# Top App Bar

Contains

Screen Title

Back Button

Optional Action

Never overload.

---

# Tabs

Used only for switching related content.

Never use Tabs as primary navigation.

---

# Progress Bar

Purpose

Show progress.

Not decoration.

Examples

Experience

Memory Level

Challenge Progress

---

# Badge

Purpose

Highlight status.

Examples

NEW

PRO

HOT

Daily

Limited

Never overuse badges.

---

# Avatar

Supports

Image

Initial

Default Illustration

Always circular.

---

# Empty State

Contains

Illustration

Title

Description

Primary Action

Avoid blank screens.

---

# Loading

Use Skeleton Loading.

Avoid large spinners whenever possible.

---

# Error State

Explain

What happened

Why

How to recover

Always provide an action.

Retry

Reload

Go Home

---

# Notification

Should be short.

Helpful.

Dismissible.

Never interrupt gameplay.

---

# Tooltip

Explain.

Do not teach.

Keep under two lines.

---

# Dropdown

Use only when options exceed available space.

Avoid nested dropdowns.

---

# Checkbox

Used for multiple selections.

---

# Radio Button

Used for single selection.

---

# Switch

Used for immediate on/off settings.

Never require Save after switching.

---

# Slider

Used only for continuous values.

Examples

Music Volume

SFX Volume

Brightness

---

# Timer

Must remain readable.

Always use monospaced numbers if possible.

---

# Score

Should update smoothly.

Avoid flashing.

---

# Leaderboard Item

Contains

Rank

Avatar

Username

Score

Optional Trend

Highlight current user.

---

# Match History Item

Contains

Game

Opponent

Result

Score

Date

View Details

---

# Accessibility

Every component must support

Keyboard

Screen Reader

Color Blindness

Touch

Responsive Layout

---

# Component Rules

Do

Reuse

Simplify

Standardize

Document

Test

Don't

Duplicate

Decorate

Overload

Reinvent