/**
 * Standardised HTTP response envelope.
 *
 * Shape sent to every client:
 * {
 *   "success": true | false,
 *   "statusCode": 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 500,
 *   "message": "Human-readable description",
 *   "data": <T> | null
 * }
 */
export class ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly statusCode: number;
  readonly message: string;
  readonly data: T | null;

  /** @internal – use static factory methods */
  constructor(success: boolean, statusCode: number, message: string, data: T | null) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /** 2xx – successful operations */
  static ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, 200, message, data);
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse(true, 201, message, data);
  }

  /** 4xx / 5xx – error responses (data is null) */
  static badRequest(message: string): ApiResponse<null> {
    return new ApiResponse(false, 400, message, null);
  }

  static unauthorized(message = 'Unauthorized'): ApiResponse<null> {
    return new ApiResponse(false, 401, message, null);
  }

  static forbidden(message = 'Forbidden'): ApiResponse<null> {
    return new ApiResponse(false, 403, message, null);
  }

  static notFound(message = 'Not found'): ApiResponse<null> {
    return new ApiResponse(false, 404, message, null);
  }

  static conflict(message: string): ApiResponse<null> {
    return new ApiResponse(false, 409, message, null);
  }

  static unprocessable(message: string): ApiResponse<null> {
    return new ApiResponse(false, 422, message, null);
  }

  static serverError(message = 'Internal server error'): ApiResponse<null> {
    return new ApiResponse(false, 500, message, null);
  }
}
