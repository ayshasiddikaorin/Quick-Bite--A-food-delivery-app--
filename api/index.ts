import 'dotenv/config';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { connectDB } from '../src/shared/db/connect';

const app = createApp();

let connecting: Promise<void> | null = null;

async function ensureDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    if (!connecting) {
      connecting = connectDB().finally(() => {
        connecting = null;
      });
    }
    await connecting;
  }
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await ensureDatabase();
    app(req, res);
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Backend running but MongoDB connection failed',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}