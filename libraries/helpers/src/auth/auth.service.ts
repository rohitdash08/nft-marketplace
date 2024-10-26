import { sign, verify } from 'jsonwebtoken';
import { hashSync, compareSync } from 'bcrypt';
import crypto from 'crypto';

export class AuthService {
  // Hash password using bcrypt with salt
  static hashPassword(password: string) {
    return hashSync(password, 10);
  }

  // Compare provided password with hashed password from the database
  static comparePassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  // Sign JWT with expiration time and algorithm for security
  static signJWT(value: object, expiresIn: string = '1h') {
    return sign(value, process.env.JWT_SECRET!, {
      expiresIn,
      algorithm: 'HS256',
    });
  }

  // Verify JWT and handle invalid token
  static verifyJWT(token: string) {
    try {
      return verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Encrypt wallet addressed or sensitive data using AES-256 encryption
  static fixedEncryption(value: string) {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16); // Initialization vector for added security
    const key = crypto.scryptSync(process.env.JWT_SECRET!, 'salt', 32); // Derive key from secret

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine the iv with encrypted data for decryption later
    return `${iv.toString('hex')}:${encrypted}`;
  }

  // Decrypt wallet addressed or sensitive data using AES-256 encryption
  static fixedDecryption(hash: string) {
    const algorithm = 'aes-256-cbc';
    const [ivHex, encrypted] = hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(process.env.JWT_SECRET!, 'salt', 32);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
