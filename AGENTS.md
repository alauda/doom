# AI Agents Configuration

This document describes the AI agents and automation configured for the `alauda/doom` monorepo.

## Overview

The `alauda/doom` repository leverages AI agents to enhance development workflow, code quality, and documentation maintenance in this yarn workspaces monorepo.

## Available Agents

### GitHub Copilot

**Purpose**: Code completion, documentation, and development assistance

**Capabilities**:

- TypeScript/JavaScript code completion and suggestions
- Documentation generation for CLI tools and APIs
- Monorepo workspace management assistance
- Build script optimization
- Test case generation

**Configuration**:

- Enabled repository-wide
- Optimized for Node.js monorepo patterns
- Configured for yarn workspaces

### CodeRabbit

**Purpose**: Automated code review and quality assurance

**Capabilities**:

- Pull request reviews with contextual feedback
- Code quality analysis
- Security vulnerability detection
- Documentation review
- Monorepo-aware reviews

**Status**: [![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/alauda/doom)](https://coderabbit.ai)

### Renovate Bot

**Purpose**: Automated dependency management

**Capabilities**:

- Dependency updates across all workspace packages
- Security patch automation
- Version compatibility checks
- Automated pull request creation for updates

**Status**: [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

### DeepWiki

**Purpose**: Intelligent documentation assistance

**Capabilities**:

- Documentation analysis and suggestions
- Content organization recommendations
- Documentation quality assessment

**Status**: [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/alauda/doom)

## Interaction Guidelines

### For Developers

When working with this repository:

1. **Copilot Integration**: Use GitHub Copilot for code completion and documentation
2. **Code Reviews**: Expect automated reviews from CodeRabbit on pull requests
3. **Dependencies**: Renovate will automatically propose dependency updates
4. **Documentation**: DeepWiki provides documentation assistance and analysis

### For Contributors

- Follow conventional commits for changelog automation
- Leverage AI suggestions but always review for monorepo context
- Use workspace-aware commands documented in README.md

### For Maintainers

- Review AI-generated pull requests from Renovate carefully
- Monitor CodeRabbit suggestions for repository-wide patterns
- Configure agents through repository settings as needed

## Agent Configuration

### Monorepo Awareness

All agents are configured to understand the yarn workspaces structure:

```
packages/
├── doom/           # @alauda/doom - Main CLI tool
└── export/         # @alauda/doom-export - Export functionality
```

### Workspace Commands Integration

Agents are aware of these monorepo commands:

- `yarn build:all` - Build all packages
- `yarn lint:all` - Lint all packages
- `yarn test:all` - Test all packages
- `yarn workspace:info` - List workspace packages

## Troubleshooting

### Agent Issues

1. **Copilot not suggesting**: Ensure the workspace context is loaded
2. **Renovate failing**: Check yarn.lock compatibility
3. **CodeRabbit missing reviews**: Verify webhook configuration
4. **DeepWiki outdated**: Documentation may need manual sync

### Monorepo Context

Agents work best when they understand:

- Package interdependencies
- Workspace-specific build processes
- Shared configuration files (tsconfig, eslint, etc.)

## Updates and Maintenance

- Agent configurations are maintained through repository settings
- Renovate config: `.renovaterc`
- CodeRabbit settings: Repository webhooks
- Copilot: Organization/repository settings

For questions about AI agent configuration, refer to the individual service documentation or contact repository maintainers.
