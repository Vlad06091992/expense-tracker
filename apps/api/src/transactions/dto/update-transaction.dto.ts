import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * DTO для частичного обновления транзакции.
 *
 * Все поля {@link CreateTransactionDto} становятся опциональными.
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
