import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process?.env?.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity{ .ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  migrationsRun: true,
  migrationsTableName: 'migrations_typeorm',
  synchronize: false,
  logging: ['error', 'warn', 'query'],
};
