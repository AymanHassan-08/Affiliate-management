# Testing Guide for Affiliate Management System

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

## Continuous Integration

Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests
- Manual workflow dispatch

### View CI Results
Check `.github/workflows/test.yml` for detailed test configuration.

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

## Best Practices

1. **Run tests before committing**
   ```bash
   bash scripts/test.sh
   ```

2. **Test locally before pushing**
   - Run all test suites
   - Check Docker build
   - Verify endpoints

3. **Keep tests updated**
   - Add tests for new features
   - Update tests when APIs change
   - Review failing tests

4. **Monitor CI/CD**
   - Check GitHub Actions status
   - Fix failing workflows immediately
   - Monitor deployment logs

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)
- [React Testing Library](https://testing-library.com/react)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
