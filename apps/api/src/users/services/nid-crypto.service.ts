import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NidCryptoService {
  private readonly key: Buffer;
  private readonly hashSecret: Buffer;

  constructor(config: ConfigService) {
    this.key = Buffer.from(
      config.getOrThrow<string>('NID_ENCRYPTION_KEY'),
      'base64',
    );
    this.hashSecret = Buffer.from(
      config.getOrThrow<string>('NID_HASH_SECRET'),
      'base64',
    );
  }

  hash(nid: string): string {
    return createHmac('sha256', this.hashSecret).update(nid).digest('hex');
  }

  encrypt(nid: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(nid, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return ['v1', iv, tag, data]
      .map((p) => (typeof p === 'string' ? p : p.toString('base64url')))
      .join(':');
  }

  decrypt(payload: string): string {
    const [version, iv, tag, data] = payload.split(':');
    if (version !== 'v1' || !iv || !tag || !data)
      throw new Error('Unknown NID format');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(data, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }
}
