import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SendBtcDto } from './dto/send-btc.dto';
import { GetBalanceParamsDto } from './dto/get-balance.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  sendBtc(@Body() dto: SendBtcDto) {
    return this.transactionsService.sendBtc(dto.userId, dto.toAddress, dto.amountBtc);
  }

  @Get(':address')
  getBalance(@Param() params: GetBalanceParamsDto) {
    return this.transactionsService.getBalance(params.address);
  }
}
