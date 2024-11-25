import { User } from '../../users/entities/user.entity';
import { INGESTION_STATUS } from '../../../utils/constants';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('ingestion_process')
export class IngestionProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: INGESTION_STATUS.PENDING })
  status: INGESTION_STATUS;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'triggeredBy', referencedColumnName: 'id' })
  @Column({ nullable: true, type: 'number' })
  triggeredBy: number;

  @Column({ nullable: true })
  ingestionDetails: string; // Details about the ingestion process

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
