import { Exclude } from 'class-transformer';
import { ROLES } from '../../../utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'enum', enum: ROLES, default: ROLES.VIEWER })
  role: ROLES;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
