# Changelog

## v0.2 — 2026-11-18

### Added
- Working edit flow for existing ordinary tasks.
- Working edit flow for existing habit rules.
- Task edits cover title, description, priority, estimate, deadline, collection and subtasks.
- Habit edits cover title, description, repeat rule and quantity target.
- Editing preserves task status and habit occurrence status.
- Quantity value and unit must be provided together or both left empty.

### Validation
- Embedded JavaScript syntax parsing passed.
- Browser interaction, responsive visual and accessibility checks are pending.

### Limitations
- In-memory demo data only.
- Habit occurrence is still represented as a single today-state demo, not date-keyed occurrence history.
- Candidate editing and complete conversions to Goal / Direction / CalendarEvent remain pending.
