import jwt from 'jsonwebtoken';

export function signToken(payload: object, expiresIn = '7d'): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn } as jwt.SignOptions);
}
