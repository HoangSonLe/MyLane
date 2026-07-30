# Color System

## Philosophy

Colors should support gameplay.

Colors should never compete with gameplay.

The interface uses colors to communicate hierarchy, state and feedback.

Never use colors purely for decoration.

---

# Design Goals

The palette should feel:

- Calm
- Modern
- Friendly
- Premium
- Focused

Players should feel relaxed before gameplay.

Players should feel excited only during interaction.

---

# Color Roles

## Background

The main application background.

Dark neutral.

Low visual noise.

Purpose:

- Reduce eye fatigue
- Make game content stand out

---

## Surface

Used for:

- Cards
- Panels
- Dialogs
- Navigation

Surface should be slightly brighter than Background.

---

## Surface Elevated

Used for

- Modal
- Floating cards
- Popup
- Dropdown

Should create depth without heavy shadows.

---

## Primary

Represents

- Main buttons
- Current selection
- Important actions

There should only be ONE primary color.

---

## Secondary

Supports Primary.

Used for

- Secondary actions
- Tabs
- Less important buttons

---

## Accent

Accent attracts attention.

Use sparingly.

Examples

- New
- Featured
- Continue
- Daily Challenge

Never overuse Accent.

---

## Success

Used for

- Correct answers
- Victory
- Completed
- Achievement

Should feel rewarding.

Never overly saturated.

---

## Warning

Used for

- Time running out
- Unfinished challenge
- Risky actions

Not for errors.

---

## Error

Only used when something actually fails.

Examples

- Network error
- Invalid input
- Server unavailable

Never use Error color for gameplay mistakes.

Gameplay mistakes should encourage retry.

---

## Information

Used for

Helpful messages.

Examples

Tips

Updates

Hints

---

# Semantic Rules

Green

↓

Success

Yellow

↓

Warning

Red

↓

Failure

Blue

↓

Information

Purple

↓

Special

Never mix meanings.

---

# Contrast

Text should always remain readable.

Primary text

Highest contrast.

Secondary text

Lower contrast.

Disabled text

Clearly visible.

Never rely only on color.

---

# Game Categories

Each game category may have an accent color.

Game accent colors must never reuse a color already assigned in Semantic Rules (Green, Yellow, Red, Blue, Purple) — see "Never mix meanings" above.

Examples

Sequence Memory

↓

Teal

Pattern Memory

↓

Magenta

Numbers

↓

Orange

Spatial

↓

Cyan

Simon

↓

Lime

The accent changes.

The UI does not.

---

# Future Themes

Support

- Light
- Dark
- AMOLED

without redesigning components.
