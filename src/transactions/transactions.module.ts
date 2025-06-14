import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
