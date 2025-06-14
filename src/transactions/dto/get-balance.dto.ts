import { IsString } from 'class-validator';

export class GetBalanceParamsDto {
  @IsString()
  address: string;
}
