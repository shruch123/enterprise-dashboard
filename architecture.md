# Weather Service Foundation — Architecture

## Purpose

This project is a maintainable full-stack foundation derived from an audit of a public weather service.

## Boundaries

### Client

Responsible for:
- Rendering UI
- User interaction
- Keyboard accessibility
- Form state
- Presenting loading, error, and result states

The client should not contain provider-specific weather API logic.

### Server

Responsible for:
- Request validation
- External weather API access
- Provider response mapping
- Stable application DTOs
- Error normalization

### Docs

Contains:
- Accessibility audit
- Architecture decisions
- Local development instructions

### Tests

Contains:
- API tests
- Accessibility tests
- Integration tests

## Project Structure

```text
weather-service-foundation/
├── client/
├── server/
├── docs/
└── tests/
```

## First Vertical Slice

```text
Search location
      |
      v
Client
      |
      v
GET /api/weather
      |
      v
Server validation
      |
      v
Weather service
      |
      v
External weather provider
      |
      v
Application DTO
      |
      v
Client result
```

## Accessibility Principles

1. Prefer semantic HTML.
2. Use native controls before custom widgets.
3. Every form control needs an accessible name.
4. Keyboard focus must remain visible.
5. Dynamic results need an appropriate announcement strategy.
6. Visual information must have an equivalent non-visual representation when it carries meaning.
7. Avoid unnecessary ARIA.

## Local Setup

Install dependencies from the repository root:

```bash
npm install
```

Run the client:

```bash
npm run dev:client
```

Run the server:

```bash
npm run dev:server
```

Run tests:

```bash
npm test
```

Run Lighthouse:

```bash
npx lighthouse https://weather.com   --only-categories=accessibility,performance,best-practices,seo   --output=html   --output-path=./docs/lighthouse-report.html
```

## Architectural Rule

The frontend consumes application-owned contracts. It should not depend directly on the schema of an external weather provider.

This makes provider replacement, testing, validation, and future feature development significantly easier.
