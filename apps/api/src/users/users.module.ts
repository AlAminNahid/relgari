import { Module } from '@nestjs/common';
import { NidCryptoService } from './services/nid-crypto.service.js';
import { UsersService } from './services/users.service.js';

@Module({
  providers: [UsersService, NidCryptoService],
  exports: [UsersService],
})
export class UsersModule {}
