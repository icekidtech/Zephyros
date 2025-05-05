// Initial implementation for NotificationsService
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  notify(message: string) {
    console.log(`Notification: ${message}`);
  }
}