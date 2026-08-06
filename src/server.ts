import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './shared/db/connect';

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
