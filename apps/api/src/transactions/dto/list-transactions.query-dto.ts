import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Query-параметры для фильтрации и пагинации списка транзакций (`GET /transactions`). */
export class ListTransactionsQueryDto {
  /** Месяц для фильтрации (1–12). Применяется только совместно с `year`. */
  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 12, description: 'Месяц (1–12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  /** Год для фильтрации (>= 1970). */
  @ApiPropertyOptional({ example: 2025, minimum: 1970, description: 'Год (>= 1970)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  year?: number;

  /** Номер страницы (начиная с 1). По умолчанию `1`. */
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1, description: 'Номер страницы' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Количество записей на странице (1–100). По умолчанию `10`. */
  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Записей на странице',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
