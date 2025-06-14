import { IsNumber, IsString, Min } from 'class-validator';

export class SendBtcDto {
  @IsNumber()
  userId: number;

  @IsString()
  toAddress: string;

  @IsNumber()
  @Min(0.000001)
  amountBtc: number;
}
