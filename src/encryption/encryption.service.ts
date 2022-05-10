import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
  async hash(plaintext: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(plaintext, saltOrRounds);
    return hash;
  }

  async compare(plaintext: string, hash: string) {
    return bcrypt.compare(plaintext, hash);
  }
}
