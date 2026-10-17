# Testing Guide for Affiliate Management System

[![CI](https://img.shields.io/github/actions/workflow/status/AymanHassan-08/Affiliate-management/test.yml?branch=main)](https://github.com/AymanHassan-08/Affiliate-management/actions)
[![Coverage](https://img.shields.io/badge/coverage-unknown-yellow)](#)
[![Tests](https://img.shields.io/badge/tests-fast%20feedback-brightgreen)](#)

Purpose
- Who: backend engineers, dashboard developers, QA, and contributors
- What: how to run, validate, and evolve tests for the product
- Why: deliver fast feedback, reduce regressions, and keep delivery agile

## Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-1-backend-unit-tests)
- [Manual Testing](#manual-testing)
- [API Endpoint Testing](#api-endpoint-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Continuous Integration](#continuous-integration)
- [Pull Request Test Checklist](#pull-request-test-checklist)
- [Test Strategy for Agile Delivery](#test-strategy-for-agile-delivery)
- [Flaky Tests and Reliability](#flaky-tests-and-reliability)
- [Troubleshooting](#troubleshooting)
- [Test Results Reporting](#test-results-reporting)
- [Best Practices](#best-practices)
- [Additional Resources](#additional-resources)

## Quick Start

### Run All Tests
```bash
bash scripts/test.sh
```

### Run Specific Test Suites
```bash
# Backend only
bash scripts/test.sh --backend-only

# Dashboard only
bash scripts/test.sh --dashboard-only

# Integration tests only
bash scripts/test.sh --integration-only

# Skip Docker tests
bash scripts/test.sh --skip-docker
```

### Helpful Local Command Patterns
```bash
# Quick full validation before push
bash scripts/test.sh

# Run backend unit and type checks only
cd backend && npm run lint && npm run type-check && npm run test

# Run dashboard validation
cd dashboard && npm run type-check && npm run build

# Watch mode for fast iteration
cd backend && npm run test -- --watch
```

## Test Structure

### 1. Backend Unit Tests
- **Location:** `backend/tests/`
- **Framework:** Vitest
- **Command:** `cd backend && npm run test`
- **Coverage:** Health checks, API endpoints, integrations

```bash
# Run backend tests
cd backend
npm run test

# Run with coverage
npm run test -- --coverage
```

### 2. Backend Type Checking
- **Command:** `cd backend && npm run type-check`
- **Purpose:** Validate TypeScript types

### 3. Backend Linting
- **Command:** `cd backend && npm run lint`
- **Purpose:** Code quality and standards

### 4. Dashboard Build Tests
- **Command:** `cd dashboard && npm run build`
- **Purpose:** Verify production build succeeds

### 5. Dashboard Type Checking
- **Command:** `cd dashboard && npm run type-check`
- **Purpose:** Validate TypeScript types

### 6. Integration Tests
- **Requirements:** Backend running on `http://localhost:3000`
- **Tests:**
  - Health endpoint: `GET /health`
  - Products endpoint: `GET /api/products`
  - Trends endpoint: `GET /api/trends`
  - Content endpoint: `GET /api/content`
  - Jobs endpoint: `GET /api/jobs`

```bash
# Example integration run
cd backend
npm run test -- --runInBand
```

### 7. Docker Tests
- **Requirements:** Docker and Docker Compose installed
- **Process:**
  1. Build all images
  2. Start containers
  3. Health checks
  4. Cleanup

## Manual Testing

### Start Development Environment

**Terminal 1 - Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
cp .env.example .env
npm install
npm run dev
```

**Terminal 3 - MongoDB (if needed):**
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run tests inside containers
docker-compose exec backend npm run test

# Stop services
docker-compose down
```

## API Endpoint Testing

### Health Check
```bash
curl -X GET http://localhost:3000/health
# Expected: { "status": "ok", "timestamp": "..." }
```

### Products
```bash
curl -X GET http://localhost:3000/api/products
# Expected: Array of products
```

### Trends
```bash
curl -X GET http://localhost:3000/api/trends
# Expected: Trend data
```

### Content Generation (Example)
```bash
curl -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "type": "description"
  }'
```

### Contract/Behavior Checks
- Verify status codes: `200`, `201`, `400`, `404`, `500`
- Validate response schema and required fields
- Test malformed payloads and edge conditions
- Confirm CORS and authentication rules for browser-facing routes

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test health endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:3000/health

# Test products endpoint
ab -n 100 -c 10 http://localhost:3000/api/products
```

### Load Testing with wrk
```bash
# Install wrk
brew install wrk  # macOS
# or apt-get install wrk  # Ubuntu

# Run load test
wrk -t4 -c100 -d30s http://localhost:3000/health
```

### Performance Heuristics
- Watch for latency spikes when product data grows
- Validate endpoints under typical production-like request patterns
- Measure worst-case response times after changes to filtering, aggregation, or pagination

## Security Testing

### Check for Vulnerabilities
```bash
# Backend
cd backend
npm audit

# Dashboard
cd dashboard
npm audit

# Fix vulnerabilities
npm audit fix
```

### CORS Testing
```bash
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3000/api/products -v
```

### Security Considerations
- Validate input sanitization for generated content and product data
- Confirm API routes reject malformed or unauthorized requests
- Verify secrets are never hard-coded in source or logs

## Continuous Integration

Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests
- Manual workflow dispatch

### Example CI Flow
```yaml
name: CI Tests
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: cd backend && npm ci && npm run lint && npm run type-check && npm run test -- --coverage

  dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: cd dashboard && npm ci && npm run type-check && npm run build
```

### View CI Results
Check `.github/workflows/test.yml` for detailed test configuration.

## Pull Request Test Checklist

Before requesting review:
- [ ] `bash scripts/test.sh` completed locally
- [ ] New features include unit tests and/or integration tests
- [ ] Type-check and lint pass: `npm run type-check && npm run lint`
- [ ] Coverage not decreased for modified modules
- [ ] Error/edge cases are covered
- [ ] CI passes for backend and dashboard
- [ ] Manual verification completed for user-visible behavior
- [ ] Flaky tests were considered and documented

## Test Strategy for Agile Delivery

### Write tests at the right level
- Unit tests for business logic and edge cases
- Integration tests for API contracts and data flow
- End-to-end smoke tests for critical journeys
- Manual exploratory checks for UX or workflow quality

### Test when it adds confidence
- New feature or bug fix: write failing test first when practical
- Refactor without behavior change: preserve expected behavior with regression tests
- API contract change: update tests and notify dependent consumers

### Fast feedback in an agile team
- Run the smallest relevant suite first
- Use watch mode for local iteration
- Keep CI pipelines parallel and time-boxed
- Prefer clear, deterministic tests over highly coupled setups

### Creative testing ideas
- Property-based testing for edge cases in product filters and payload validation
- Mutation testing to check whether tests actually detect bad changes
- Visual regression checks for dashboard UI regressions
- Contract testing between backend API responses and frontend assumptions
- Fuzz-like input checks for generated content endpoints and request validation

## Flaky Tests and Reliability

### Flaky test policy
- Treat flaky tests as a production risk
- Investigate within 24 hours of detection
- Add a clear issue or owner to each flaky failure
- Avoid masking real failures with broad retries unless justified

### Reliability tips
- Prefer deterministic fixtures and seeded test data
- Avoid sleep-based assertions when a condition can be awaited
- Minimize shared state between tests
- Clean up database and temporary files after each run

## Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -rf backend/node_modules
cd backend && npm install && npm run dev
```

### MongoDB connection fails
```bash
# Check MONGO_URI in .env
# Verify MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker-compose down && docker-compose up -d mongodb
```

### Dashboard can't connect to backend
```bash
# Verify backend URL in dashboard/.env
cat dashboard/.env | grep VITE_

# Test backend connectivity
curl http://localhost:3000/health
```

### Docker build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

### Test fails intermittently
```bash
# Re-run only that suite
cd backend && npm run test -- --run

# Check for shared state or time-based assumptions
# Review CI logs and isolate failing test order dependence
```

## Test Results Reporting

### Generate Coverage Report
```bash
cd backend
npm run test -- --coverage
open coverage/index.html  # View in browser
```

### Export Test Results
```bash
# Tests output to console by default
# For CI, check GitHub Actions workflow logs
```

### Useful metrics
- Test pass rate by suite
- Runtime trends over time
- Coverage by domain/module
- Number of flaky tests caught and resolved

## Best Practices

1. **Run tests before committing**
   ```bash
   bash scripts/test.sh
   ```

2. **Test locally before pushing**
   - Run all test suites
   - Check Docker build
   - Verify endpoints
   - Validate the user story or acceptance criteria

3. **Keep tests updated**
   - Add tests for new features
   - Update tests when APIs change
   - Review failing tests immediately
   - Remove or modernize obsolete tests

4. **Monitor CI/CD**
   - Check GitHub Actions status
   - Fix failing workflows immediately
   - Monitor deployment logs
   - Measure regression patterns over time

5. **Balance speed and confidence**
   - Keep unit tests fast and deterministic
   - Allow slower integration checks to catch cross-system issues
   - Use a layered testing strategy for sustainable delivery

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)
- [React Testing Library](https://testing-library.com/react)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Playwright Documentation](https://playwright.dev/)
- [Fast-check](https://fast-check.dev/)

