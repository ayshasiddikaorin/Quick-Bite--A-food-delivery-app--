/**
 * In-memory MongoDB helper for integration tests.
 * Uses the real MONGO_URI from .env but a dedicated test database
 * so production data is never touched.
 */
import mongoose from 'mongoose';
import 'dotenv/config';

// Point tests at a separate DB to avoid polluting dev data
const TEST_URI = (process.env.MONGO_URI as string).replace(
  /\/[^/?]+(\?|$)/,
  '/fooddelivery_test$1',
);

export async function connectTestDB(): Promise<void> {
  await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 10_000 });
}

export async function clearTestDB(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((col) => col.deleteMany({})),
  );
}

export async function disconnectTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}
