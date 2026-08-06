import { Response } from 'express';
import { ApiResponse } from '../dto/ApiResponse';

/**
 * Serialise an ApiResponse instance and write it to the Express Response.
 * Use this in every controller — it guarantees a consistent envelope shape.
 */
export function send<T>(res: Response, apiResponse: ApiResponse<T>): void {
  res.status(apiResponse.statusCode).json(apiResponse);
}

// ── Convenience wrappers (mirror ApiResponse statics) ─────────────────────────

export function sendOk<T>(res: Response, data: T, message = 'Success'): void {
  send(res, ApiResponse.ok(data, message));
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  send(res, ApiResponse.created(data, message));
}
