import {
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TrainsModule } from '../trains/trains.module.js';
import { QueueController } from './controllers/queue.controller.js';
import { QueueService } from './services/queue.service.js';

@Injectable()
class QueueSweeper implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  constructor(private readonly queue: QueueService) {}
  onModuleInit() {
    this.timer = setInterval(() => this.queue.sweep(), 60_000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

@Module({
  imports: [AuthModule, TrainsModule],
  controllers: [QueueController],
  providers: [QueueService, QueueSweeper],
})
export class QueueModule {}
