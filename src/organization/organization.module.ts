import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationSchema } from './organization.schema';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: 'Organization', schema: OrganizationSchema }]),
    ],
    controllers: [OrganizationController],
    providers: [OrganizationService],
  })
  export class OrganizationModule {}