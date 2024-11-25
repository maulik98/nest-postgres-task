import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { IngestionProcess } from './entity/ingestion-task.entity';
import { INGESTION_STATUS } from 'src/utils/constants';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionProcess)
    private readonly ingestionRepository: Repository<IngestionProcess>,
  ) {}

  // Trigger the ingestion process
  async triggerIngestion(triggeredBy: number, details: string) {
    const ingestionProcess = new IngestionProcess();
    ingestionProcess.status = INGESTION_STATUS.PENDING;
    ingestionProcess.triggeredBy = triggeredBy;
    ingestionProcess.ingestionDetails = details;

    // Save the initial ingestion process in the DB
    const savedProcess = await this.ingestionRepository.save(ingestionProcess);

    try {
      // Trigger the ingestion process (e.g., via a Python backend API)
      const response = await axios.get(
        `https://www.google.com`,
      );

      if (response.status === 200) {
        await this.updateIngestionStatus(
          savedProcess.id,
          INGESTION_STATUS.IN_PROGRESS,
        );
        // Further logic to monitor the process and update its status
      }
    } catch (error) {
      await this.updateIngestionStatus(
        savedProcess.id,
        INGESTION_STATUS.FAILED,
      );
      throw new Error('Ingestion failed: ' + error.message);
    }

    return savedProcess;
  }

  // Update ingestion process status
  async updateIngestionStatus(id: number, status: INGESTION_STATUS) {
    await this.ingestionRepository.update(id, { status });
  }

  // Get the status of an ingestion process
  async getIngestionStatus(id: number) {
    return await this.ingestionRepository.findOneBy({ id });
  }

  // Get all ingestion processes
  async getAllIngestionProcesses() {
    return await this.ingestionRepository.find();
  }
}
