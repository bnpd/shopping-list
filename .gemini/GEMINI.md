# Instructions for GitHub Copilot

## Core Development Principles
### Code Quality First
- Write maintainable, best-practice code
- Where necessary, handle errors and edge cases
- Adhere to project style and patterns
- Before deciding you are done, check for errors

### Testing Focus
- TDD
- Test edge cases, invalid inputs, and permissions
- Ensure test isolation with setup/teardown

### Security Mindedness
- Consider security implications in API endpoints
- Validate and sanitize inputs
- Protect sensitive data

### Performance Awareness
- Optimize database queries and API calls
- Consider caching where appropriate
- Follow lazy loading patterns

## Project-Specific Knowledge
### Svelte v5, SvelteKit deployed as static sites
- Understand component lifecycle and reactivity
- Use proper state management patterns
- Follow the established UI/UX patterns

## Communication Style
### Clear and Concise
- Provide direct, actionable suggestions
- Break down complex tasks into steps
- Briefly justify design choices

### Context-Aware
- Consider the project's existing architecture
- Reference relevant existing code
- Suggest improvements & refactoring
- Don't change unrelated code without asking.

### Documentation
- Use JSDoc for complex logic
- Add inline comments only for non-obvious code
- Update README as needed
- Document breaking changes
