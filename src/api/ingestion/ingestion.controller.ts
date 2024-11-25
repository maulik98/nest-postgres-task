import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { INGESTION_STATUS, ROLES } from 'src/utils/constants';

@Controller('ingestion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  async triggerIngestion(
    @Body() body: { triggeredBy: string; details: string },
    @Req() req,
  ) {
    return await this.ingestionService.triggerIngestion(
      req.user.id,
      body.details,
    );
  }

  @Post('completed')
  async ingestionCompleted(@Body() body: { processId: number }) {
    const { processId } = body;

    // Update the status to 'completed'
    return await this.ingestionService.updateIngestionStatus(
      processId,
      INGESTION_STATUS.COMPLETED,
    );
  }

  @Get('status/:id')
  async getIngestionStatus(@Param('id') id: number) {
    return await this.ingestionService.getIngestionStatus(id);
  }

  @Get('all')
  async getAllIngestionProcesses() {
    return await this.ingestionService.getAllIngestionProcesses();
  }
}
