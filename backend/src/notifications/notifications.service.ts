import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly transporter = nodemailer.createTransport({
    service: 'gmail', // Example: Use Gmail as the email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  async notifyByEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: message,
      });
      console.log(`Email sent to ${email} with subject: ${subject}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }

  notify(message: string) {
    console.log(`Notification: ${message}`);
  }

  notifyByWebhook(url: string, payload: any): void {
    // Simulate sending a webhook notification
    console.log(`Webhook sent to ${url} with payload:`, payload);
  }
}