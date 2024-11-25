import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/config';
import { DocumentsModule } from './api/documents/documents.module';
import { IngestionModule } from './api/ingestion/ingestion.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
