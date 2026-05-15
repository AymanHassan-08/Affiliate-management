# Product Schema Project

A TypeScript project containing the unified product schema used for Amazon + AliExpress integrations.

## Structure
- `/src/types/product.ts` — main schema
- `/src/index.ts` — example usage
- `tsconfig.json` — TypeScript config
- `package.json` — project metadata

## Commands
- `npm install`
- `npm run build`
- `npm start`

## Deployed Endpoints & Services

### Production Environment
- **Status**: Not yet deployed
- **Base URL**: [To be configured]
- **API Documentation**: [To be configured]

### Staging Environment
- **Status**: Not yet deployed
- **Base URL**: [To be configured]

### Local Development
- **Base URL**: `http://localhost:3000`
- **Command**: `npm start`

## Testing Deployed Settings

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Test Checklist
- [ ] Build compiles successfully: `npm run build`
- [ ] All dependencies installed: `npm install`
- [ ] Local development server starts: `npm start`
- [ ] Environment variables configured
- [ ] Integration tests pass
- [ ] Schema validation works for Amazon products
- [ ] Schema validation works for AliExpress products

## Configuration
Environment variables needed for deployment:
```
NODE_ENV=production
API_PORT=3000
AMAZON_API_KEY=<your-amazon-api-key>
ALIEXPRESS_API_KEY=<your-aliexpress-api-key>
```

---

# Affiliate-management
Affiliate accounts mentoring
