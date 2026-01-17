# Contributing to Desktop Ethereal

Thank you for your interest in contributing to Desktop Ethereal! This document provides guidelines and information to help you contribute effectively.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and mentor them
- Focus on constructive feedback
- Separate personal beliefs from technical discussions
- Take responsibility for your actions

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check existing issues to avoid duplicates
2. Try reproducing on the latest version
3. Gather relevant information (OS, GPU, steps to reproduce)

When submitting a bug report:

- Use a clear and descriptive title
- Describe the exact steps to reproduce
- Explain the expected vs. actual behavior
- Include screenshots if applicable
- Provide system information (OS version, GPU model, etc.)

### Suggesting Enhancements

Feature requests are welcome! Before submitting:

1. Check if the feature already exists or is planned
2. Consider if it aligns with the project's goals
3. Think about implementation complexity

When suggesting enhancements:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain the benefits and use cases
- Consider potential drawbacks or trade-offs
- Include examples or mockups if helpful

### Code Contributions

#### Getting Started

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Follow the development setup in `docs/development.md`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

#### Development Process

1. **Branch Naming**: Use descriptive names like `feature/new-animation` or `bugfix/window-drag-issue`
2. **Commit Messages**: Follow conventional commit format:

   ```
   feat: Add new animation system
   fix: Resolve window dragging issue
   docs: Update contribution guidelines
   ```

3. **Code Style**: Follow existing code conventions
4. **Testing**: Add tests for new functionality
5. **Documentation**: Update relevant documentation

#### Pull Request Process

1. Ensure your PR addresses a single issue or implements one feature
2. Include a clear description of changes
3. Reference related issues using keywords like "Fixes #123"
4. Request review from maintainers
5. Address feedback promptly
6. Merge after approval (maintainers will handle merging)

## Development Guidelines

### Code Quality

- Write clean, readable code
- Follow language-specific style guides
- Include comments for complex logic
- Use meaningful variable and function names
- Avoid code duplication

### Testing

- Write unit tests for new functionality
- Ensure existing tests pass
- Test on multiple platforms when possible
- Include edge case testing

### Documentation

- Update README.md for user-facing changes
- Add API documentation for new functions
- Include usage examples
- Keep documentation up to date with code changes

### Performance

- Optimize for resource efficiency
- Minimize memory allocations
- Use appropriate data structures
- Profile performance-critical code

## Project Structure

Understanding the project structure is important for effective contributions:

```
ethereal/
├── src/                 # Frontend (React/TypeScript)
├── src-tauri/           # Backend (Rust)
├── public/              # Static assets
├── docs/                # Documentation
└── tests/               # Test files (when added)
```

### Frontend (src/)

- Components: Reusable UI elements
- Hooks: Custom React hooks
- Config: Configuration files
- Utils: Utility functions

### Backend (src-tauri/)

- Main: Application entry point and setup
- Modules: System-specific implementations
- Utils: Backend utility functions

## Communication

### Getting Help

- Check existing documentation and issues
- Join our community discussions (link to be added)
- Ask questions in issues tagged "question"
- Reach out to maintainers directly for complex topics

### Discussions

We encourage:

- Technical discussions in issues
- Feature proposals in dedicated proposal issues
- Community interaction in discussions
- Knowledge sharing through documentation

## Recognition

Contributors will be recognized in:

- Commit history
- Release notes
- Contributor list (when established)
- Project documentation

## Legal Considerations

### Licensing

By contributing, you agree that your contributions will be licensed under the project's MIT License.

### Copyright

- Assign copyright to the project maintainers
- Ensure you have rights to contribute the code
- Do not contribute code from other projects without permission

### Patents

- Grant patent rights for your contributions
- Do not contribute patented code without proper licensing

## Review Process

### Code Review

All submissions require review:

1. **Automated Checks**: CI tests must pass
2. **Peer Review**: At least one maintainer review
3. **Quality Check**: Code quality and style adherence
4. **Documentation**: Adequate documentation updates
5. **Testing**: Sufficient test coverage

### Review Criteria

Reviewers will consider:

- Correctness and reliability
- Performance impact
- Security implications
- Maintainability
- Consistency with project goals
- Documentation quality

## Community

### Maintainers

Current maintainers:

- [Your Name] - Project creator and lead maintainer

### Contributors

We welcome contributors of all skill levels. Whether you're fixing typos or implementing complex features, your contributions are valued.

### Events

We plan to participate in:

- Hacktoberfest
- Google Summer of Code (when eligible)
- Local hackathons and meetups

## Resources

### Learning Materials

- Tauri documentation
- Rust programming language book
- React documentation
- TypeScript handbook

### Tools

- Rust analyzer for IDE support
- Tauri CLI for development
- Vite for frontend tooling
- Testing frameworks (to be determined)

## Questions?

If you have any questions about contributing, feel free to:

1. Open an issue with your question
2. Check existing documentation
3. Contact the maintainers directly
4. Join community discussions (when available)

Thank you for contributing to Desktop Ethereal!
