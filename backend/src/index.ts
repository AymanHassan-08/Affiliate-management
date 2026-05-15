import app from './app.js';
import { config } from './config/index.js';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`CORS Origin: ${config.CORS_ORIGIN}`);
});
