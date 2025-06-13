import { DataSource, DataSourceOptions } from 'typeorm';
import * as entities from '../entities/index';
import * as dotenv from 'dotenv';

dotenv.config();

export const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: Object.values(entities),
  migrations: ['src/database/migrations/*.ts'],
};

export const dataSource = new DataSource(baseConfig);
