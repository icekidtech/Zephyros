import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { ProductsModule } from './products/products.module';
import { MilestonesModule } from './milestones/milestones.module';
import { QrModule } from './qr/qr.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { UploadsModule } from './uploads/uploads.module';
import { LoggingModule } from './logging/logging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
    }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 10,
    }]),
    MongooseModule.forRoot(process.env.MONGO_URI),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganizationModule,
    ProductsModule,
    MilestonesModule,
    QrModule,
    BlockchainModule,
    UploadsModule,
    LoggingModule,
    NotificationsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
