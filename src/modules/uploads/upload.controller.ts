import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../../shared/errors/AppError';
import { sendOk } from '../../shared/utils/response';

const ALLOWED_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Directory where uploaded images are stored (root of the project). */
const UPLOAD_DIR = path.resolve(__dirname, '../../..', 'uploads');

export class UploadController {
  /**
   * POST /api/v1/uploads/image
   * Body: { data: string, ext?: string }
   *   data — raw base64 or a full data-URI like `data:image/png;base64,...`
   * Responds with { url } pointing to the stored image.
   */
  createImage = (req: Request, res: Response): void => {
    const raw = typeof req.body?.data === 'string' ? req.body.data : '';

    if (!raw) throw new AppError('No image data provided', 400);

    // Extract base64 payload + mime type (if the data-URI form was sent)
    let b64 = raw;
    let ext = typeof req.body?.ext === 'string' ? req.body.ext.toLowerCase() : '';
    const dataUriMatch = /^data:([^;]+);base64,(.+)$/.exec(raw);
    if (dataUriMatch) {
      const mime = dataUriMatch[1];
      ext = Object.keys(ALLOWED_EXT).find((e) => ALLOWED_EXT[e] === mime) ?? ext;
      b64 = dataUriMatch[2];
    }

    if (!ALLOWED_EXT[ext]) throw new AppError('Unsupported image type (png, jpg, jpeg, webp, gif)', 400);

    const buffer = Buffer.from(b64, 'base64');
    if (buffer.length === 0) throw new AppError('Image data is empty', 400);
    if (buffer.length > 10 * 1024 * 1024) {
      throw new AppError('Image is too large (max 10MB)', 400);
    }

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

    // Store a RELATIVE path, not an absolute host-based URL. The app resolves
    // relative paths against whatever API host it is currently using, so
    // uploaded images keep working across emulator / physical device / LAN IP.
    sendOk(res, { url: `/uploads/${filename}` }, 'Image uploaded');
  };
}