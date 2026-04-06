import {
  IsString, IsNumber, IsEnum, IsOptional, IsArray,
  ValidateNested, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class ExpenseDataDto {
  @IsString() clientId: string;
  @IsEnum(['expense', 'income']) type: string;
  @IsString() title: string;
  @IsNumber() amount: number;
  @IsString() category: string;
  @IsString() date: string;
  @IsString() paymentMethod: string;
  @IsOptional() @IsString() notes?: string;
  @IsString() createdAt: string;
  @IsString() updatedAt: string;
}

class SyncOperationDto {
  @IsString() opId: string;
  @IsIn(['create', 'update', 'delete']) type: 'create' | 'update' | 'delete';
  @IsString() clientId: string;
  @IsOptional() @ValidateNested() @Type(() => ExpenseDataDto) data?: ExpenseDataDto;
}

export class SyncDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations: SyncOperationDto[];
}
