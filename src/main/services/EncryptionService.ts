import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 64;
  private tagLength = 16;

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Derive encryption key from password
   */
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt data with password
   */
  encrypt(data: string, password: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const key = this.deriveKey(password, salt);
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = (cipher as any).getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return result.toString('base64');
  }

  /**
   * Decrypt data with password
   */
  decrypt(encryptedData: string, password: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.slice(0, this.saltLength);
    const iv = buffer.slice(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.slice(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = buffer.slice(this.saltLength + this.ivLength + this.tagLength);
    
    const key = this.deriveKey(password, salt);
    
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    (decipher as any).setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Mask sensitive data (for display purposes)
   */
  maskData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) {
      return '****';
    }
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }

  /**
   * Generate a random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

