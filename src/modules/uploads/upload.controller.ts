import { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { sendOk } from '../../shared/utils/response';
import { Image } from './image.model';

const ALLOWED_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

const MAX_BYTES = 8 * 1024 * 1024;

export class UploadController {
  /**
   * POST /api/v1/uploads/image
   * Body: { data: string, ext?: string }
   *   data — raw base64 or a full data-URI like `data:image/png;base64,...`
   * Stores the image in MongoDB (serverless-friendly) and responds with
   * { url: '/api/v1/uploads/image/<id>' }.
   */
  createImage = async (req: Request, res: Response): Promise<void> => {
    const raw = typeof req.body?.data === 'string' ? req.body.data : '';
    if (!raw) throw new AppError('No image data provided', 400);

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
    if (buffer.length > MAX_BYTES) throw new AppError(`Image is too large (max ${MAX_BYTES / 1024 / 1024}MB)`, 400);

    const doc = await Image.create({
      data: buffer,
      mimeType: ALLOWED_EXT[ext],
      size: buffer.length,
      originalExt: ext,
    });

    // Relative URL — the app resolves it against whatever API host it uses,
    // so uploaded images work on emulator / physical device / LAN / prod.
    sendOk(res, { url: `/api/v1/uploads/image/${doc._id}` }, 'Image uploaded');
  };

  /**
   * GET /api/v1/uploads/image/:id
   * Streams the stored image back with the correct Content-Type.
   */
  getImage = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new AppError('Image id is required', 400);

    const doc = await Image.findById(id);
    if (!doc) throw new AppError('Image not found', 404);

    res.set('Content-Type', doc.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(doc.data);
  };
}
