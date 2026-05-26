import { TransactionType } from '@repo/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/** DTO для создания транзакции. */
export class CreateTransactionDto {
  /** Сумма транзакции (положительное число, не более двух знаков после запятой). */
  @ApiProperty({
    example: 1500.5,
    description: 'Сумма транзакции (> 0, до 2 знаков после запятой)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  /** Тип транзакции: `INCOME` (доход) или `EXPENSE` (расход). */
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Тип: INCOME или EXPENSE',
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  /** Необязательное описание (до 500 символов). */
  @ApiPropertyOptional({ example: 'Продукты в супермаркете', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** Дата транзакции в формате ISO 8601 (например, `2025-05-24`). */
  @ApiProperty({ example: '2025-05-24', description: 'Дата в формате ISO 8601' })
  @IsDateString()
  date!: string;

  /** UUID категории. Если не указан, транзакция создаётся без категории. */
  @ApiPropertyOptional({ example: 'cuid_abc123', description: 'UUID категории (опционально)' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
