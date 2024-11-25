import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/api/users/entities/user.entity';
import { Document } from './src/api/documents/entities/document.entity';
import { IngestionProcess } from './src/api/ingestion/entity/ingestion-task.entity';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process?.env?.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Document, IngestionProcess],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  migrationsRun: true,
  migrationsTableName: 'migrations_typeorm',
  synchronize: false,
  logging: ['error', 'warn', 'query'],
});
