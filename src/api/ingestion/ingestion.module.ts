import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionProcess } from './entity/ingestion-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IngestionProcess])],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
