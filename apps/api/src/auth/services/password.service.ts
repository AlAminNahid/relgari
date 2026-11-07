import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import {
  ARGON2_MEMORY_COST,
  ARGON2_PARALLELISM,
  ARGON2_TIME_COST,
} from '../../shared/constants/security.constants.js';

const OPTIONS = {
  type: argon2.argon2id,
  memoryCost: ARGON2_MEMORY_COST,
  timeCost: ARGON2_TIME_COST,
  parallelism: ARGON2_PARALLELISM,
} as const;

@Injectable()
export class PasswordService {
  private readonly dummyHash = argon2.hash(
    randomBytes(16).toString('hex'),
    OPTIONS,
  );

  hash(password: string): Promise<string> {
    return argon2.hash(password, OPTIONS);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  async spendTimeLikeAVerify(password: string): Promise<void> {
    await this.verify(await this.dummyHash, password);
  }
}
