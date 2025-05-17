// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Organization, OrganizationSchema } from '../organization/organization.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Milestone, MilestoneSchema } from '../milestones/milestone.schema';

@Module({
  imports: [    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Milestone.name, schema: MilestoneSchema },
    ]),
  ],
})
export class DatabaseModule {}
