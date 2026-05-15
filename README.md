# Affiliate Management System

A full-stack TypeScript project for managing affiliate accounts with unified product schema integrations for Amazon and AliExpress.

## Project Structure

### Backend (`/backend`)
- `/src/amazon` — Amazon API integration
- `/src/aliexpress` — AliExpress API integration
- `/src/normalization` — Product data normalization
- `/src/trend` — Trend analysis and forecasting
- `/src/content` — Content management
- `/src/publish` — Publishing workflows
- `/src/models` — Database models
- `/src/routes` — API routes
- `/src/jobs` — Background jobs and workers
- `/src/utils` — Utility functions
- `/src/config` — Configuration management
- `/src/types` — TypeScript type definitions
- `app.ts` — Express app setup
- `index.ts` — Server entry point

### Dashboard (`/dashboard`)
- `/src/components` — React components
- `/src/pages` — Page components
- `/src/api` — API client with axios configuration
- `App.tsx` — Main app component
- `main.tsx` — Vite entry point
- Tailwind CSS configuration

## Deployed Endpoints & Services

### Production Environment
| Service | URL | Health Check |
|---------|-----|--------------|
| Backend API | `https://api.affiliate-mgmt.example.com` | `GET /health` |
| Dashboard | `https://dashboard.affiliate-mgmt.example.com` | Dashboard loads |
| WebSocket | `wss://api.affiliate-mgmt.example.com/ws` | Real-time updates |

### Staging Environment
| Service | URL | Health Check |
|---------|-----|--------------|
| Backend API | `https://staging-api.affiliate-mgmt.example.com` | `GET /health` |
| Dashboard | `https://staging-dashboard.affiliate-mgmt.example.com` | Dashboard loads |

### Core API Endpoints

#### Health & Status
- `GET /health` — Server health check
- `GET /status` — Detailed system status

#### Amazon Integration
- `GET /api/amazon/products` — Fetch Amazon products
- `POST /api/amazon/sync` — Sync Amazon catalog
- `GET /api/amazon/trends` — Get Amazon trends
- `POST /api/amazon/publish` — Publish to Amazon

#### AliExpress Integration
- `GET /api/aliexpress/products` — Fetch AliExpress products
- `POST /api/aliexpress/sync` — Sync AliExpress catalog
- `GET /api/aliexpress/trends` — Get AliExpress trends
- `POST /api/aliexpress/publish` — Publish to AliExpress

#### Product Management
- `GET /api/products` — List all products
- `GET /api/products/:id` — Get product by ID
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

#### Normalization & Transformation
- `POST /api/normalize` — Normalize product data
- `GET /api/normalized/:id` — Get normalized product

#### Analytics & Trends
- `GET /api/trends` — Get trend data
- `GET /api/trends/:category` — Get category trends
- `POST /api/trends/analyze` — Analyze trends

#### Content Management
- `GET /api/content` — List content
- `POST /api/content` — Create content
- `PUT /api/content/:id` — Update content

#### Publishing
- `POST /api/publish` — Publish products
- `GET /api/publish/queue` — Get publish queue
- `GET /api/publish/history` — Get publish history

#### Background Jobs
- `GET /api/jobs` — List active jobs
- `GET /api/jobs/:id` — Get job status
- `POST /api/jobs/:id/cancel` — Cancel job

#### Internal Discovery & Publishing (Dashboard Integration)
- `POST /api/internal/discover` — Discover new products from affiliate networks
  - Request: `{ "source": "amazon" | "aliexpress", "category": "string" }`
  - Response: `{ "count": number, "products": Product[] }`
  
- `POST /api/internal/refresh` — Refresh/update existing product data
  - Request: `{ "productIds": string[], "force": boolean }`
  - Response: `{ "updated": number, "failed": number, "details": object[] }`
  
- `POST /api/internal/publish` — Publish discovered products to affiliate platforms
  - Request: `{ "productIds": string[], "target": "amazon" | "aliexpress", "schedule": "immediate" | "scheduled" }`
  - Response: `{ "published": number, "failed": number, "queueId": string }`

### External Services & Integrations

| Service | Purpose | Configuration |
|---------|---------|----------------|
| Amazon Product API | Product catalog sync & affiliate linking | `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG` |
| AliExpress API | Product catalog sync | `ALIEXPRESS_API_KEY`, `ALIEXPRESS_API_SECRET` |
| MongoDB Atlas | Data persistence | `MONGO_URI` |
| Message Queue | Background jobs | Job service configuration |

## Environment Configuration

### Backend Environment Variables
```bash
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
MONGO_URI=your_mongodb_atlas_uri

# Amazon Affiliate Integration
AMAZON_ACCESS_KEY=xxx
AMAZON_SECRET_KEY=xxx
AMAZON_PARTNER_TAG=xxx

# AliExpress Integration
ALIEXPRESS_API_KEY=your_aliexpress_key
ALIEXPRESS_API_SECRET=your_aliexpress_secret

# JWT Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Email Notifications (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=email_password
```

### Dashboard Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws
VITE_ENV=development

# Backend Base URL for Axios
VITE_BACKEND_URL=http://localhost:3000
```

## Installation & Setup

### Backend
```bash
cd backend
npm install
npm run dev        # Development with hot reload
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev        # Development server on http://localhost:5173
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:3000
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

### Production

**Backend:**
```bash
cd backend
npm install
npm run build
npm start
# Server runs on http://localhost:3000 (or PORT from env)
```

**Dashboard:**
```bash
cd dashboard
npm install
npm run build
npm run preview
# Preview runs on http://localhost:4173
```

## Dashboard API Client Setup

The dashboard uses Axios for API communication. Configure it in `/dashboard/src/api/`:

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api'
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Testing Deployed Settings

### 1. Backend Health Check
```bash
curl -X GET http://localhost:3000/health
# Expected response: { "status": "ok", "timestamp": "2026-05-15T..." }
```

### 2. Verify MongoDB Connection
```bash
curl -X GET http://localhost:3000/status
# Check database connection status
```

### 3. Test Amazon Integration
```bash
curl -X GET http://localhost:3000/api/amazon/products
# Expected response: Array of products from Amazon API
```

### 4. Test AliExpress Integration
```bash
curl -X GET http://localhost:3000/api/aliexpress/products
# Expected response: Array of products from AliExpress API
```

### 5. Test Product Discovery
```bash
curl -X POST http://localhost:3000/api/internal/discover \
  -H "Content-Type: application/json" \
  -d '{"source": "amazon", "category": "electronics"}'
# Expected response: { "count": N, "products": [...] }
```

### 6. Test Product Refresh
```bash
curl -X POST http://localhost:3000/api/internal/refresh \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["id1", "id2"], "force": false}'
# Expected response: { "updated": N, "failed": N, "details": [...] }
```

### 7. Test Product Publishing
```bash
curl -X POST http://localhost:3000/api/internal/publish \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["id1"], "target": "amazon", "schedule": "immediate"}'
# Expected response: { "published": N, "failed": N, "queueId": "..." }
```

### 8. Verify Dashboard
- Navigate to `http://localhost:5173`
- Check browser console (F12) for errors
- Verify API connectivity in Network tab

### 9. Monitor Background Jobs
```bash
curl -X GET http://localhost:3000/api/jobs
# Expected response: Array of background jobs
```

### 10. Check Logs
```bash
# Backend development logs appear in Terminal 1
# Dashboard development logs appear in Terminal 2
# Watch for any errors related to:
grep "amazon" logs/app.log
grep "aliexpress" logs/app.log
grep "error" logs/app.log
```

## Monitoring & Observability

### Local Development Logs
- Backend logs appear in Terminal 1
- Dashboard logs appear in Terminal 2
- Check browser DevTools for frontend errors

### Key Metrics to Monitor
- API response times
- Database query performance
- Amazon API sync success rate
- AliExpress API sync success rate
- Product discovery performance
- Memory and CPU usage

### Common Issues & Troubleshooting

**Issue: MongoDB connection fails**
- Check `MONGO_URI` is correct
- Verify MongoDB Atlas IP whitelist includes your machine
- Ensure cluster is running

**Issue: Amazon API returns 403**
- Verify `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG`
- Check credentials have correct permissions
- Verify Partner Tag is associated with correct affiliate account

**Issue: Dashboard can't connect to backend**
- Verify backend is running on port 3000
- Check `VITE_BACKEND_URL` is set correctly in `.env`
- Ensure CORS is enabled in backend
- Check browser Network tab for failed requests

**Issue: Product discovery returns empty**
- Verify API credentials are valid
- Check rate limits aren't exceeded
- Ensure categories are correct
- Check backend logs for API errors

**Issue: Build fails**
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist/`
- Check Node version: `node --version` (v16+ required)

## Commands Reference

### Backend
```bash
npm install       # Install dependencies
npm run dev       # Development with hot reload
npm run build     # Build TypeScript
npm start         # Start compiled server
npm run test      # Run tests
npm run lint      # Lint code
npm run type-check # TypeScript type checking
```

### Dashboard
```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Lint code
npm run type-check # Type check
```

## Support & Documentation

- **Local API**: `http://localhost:3000`
- **Local Dashboard**: `http://localhost:5173`
- **API Docs**: Check `/src/routes` for endpoint documentation
- **Issues**: Report via GitHub Issues
- **Contributing**: See `CONTRIBUTING.md`

## License

MIT
