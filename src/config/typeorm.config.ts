import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { baseConfig } from 'src/database/data-source';

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  synchronize: false,
};
