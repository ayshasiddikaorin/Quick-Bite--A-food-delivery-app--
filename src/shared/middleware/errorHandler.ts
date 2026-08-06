import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ApiResponse } from '../dto/ApiResponse';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const dto = new (ApiResponse as any)(false, err.statusCode, err.message, null);
    res.status(err.statusCode).json(dto);
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
    res.status(409).json(ApiResponse.conflict(`${field} already exists`));
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(', ');
    res.status(422).json(ApiResponse.unprocessable(messages));
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json(ApiResponse.serverError());
}
