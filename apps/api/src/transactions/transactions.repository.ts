import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

/** Параметры фильтрации транзакций по календарному периоду. */
export interface PeriodFilter {
  /** Номер месяца (1–12). Применяется только совместно с `year`. */
  month?: number;
  /** Год (например, 2025). */
  year?: number;
}

/** Параметры смещения для Prisma-запросов с пагинацией. */
export interface PaginationParams {
  /** Количество записей, которые нужно пропустить. */
  skip: number;
  /** Максимальное количество возвращаемых записей. */
  take: number;
}

/**
 * Репозиторий транзакций.
 *
 * Инкапсулирует все Prisma-запросы к таблице `Transaction`.
 * Гарантирует изоляцию данных: каждый метод принимает `userId`
 * и работает исключительно с записями этого пользователя.
 */
@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Строит фильтр по дате на основе периода.
   *
   * @param period - Год и/или месяц для фильтрации.
   * @returns Объект `Prisma.DateTimeFilter` или `undefined`, если период не задан.
   */
  private buildDateFilter({ month, year }: PeriodFilter): Prisma.DateTimeFilter | undefined {
    if (year && month) {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      return { gte: start, lt: end };
    }
    if (year) {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      return { gte: start, lt: end };
    }
    return undefined;
  }

  /**
   * Возвращает список транзакций пользователя с сортировкой по дате (убывание).
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param period - Фильтр по периоду.
   * @param pagination - Параметры пагинации (`skip`, `take`).
   * @returns Массив транзакций.
   */
  findAllByUser(userId: string, period: PeriodFilter, pagination: PaginationParams) {
    const date = this.buildDateFilter(period);
    return this.prisma.transaction.findMany({
      where: { userId, ...(date ? { date } : {}) },
      orderBy: { date: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  /**
   * Считает количество транзакций пользователя за период.
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param period - Фильтр по периоду.
   * @returns Число транзакций.
   */
  countByUser(userId: string, period: PeriodFilter) {
    const date = this.buildDateFilter(period);
    return this.prisma.transaction.count({
      where: { userId, ...(date ? { date } : {}) },
    });
  }

  /**
   * Возвращает одну транзакцию, принадлежащую пользователю.
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param id - UUID транзакции.
   * @returns Найденная транзакция.
   * @throws {NotFoundException} Если транзакция не существует или принадлежит другому пользователю.
   */
  async findOneByUser(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Создаёт новую транзакцию.
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param dto - Данные новой транзакции.
   * @returns Созданная транзакция.
   */
  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        type: dto.type,
        description: dto.description,
        date: new Date(dto.date),
        categoryId: dto.categoryId,
        userId,
      },
    });
  }

  /**
   * Обновляет транзакцию пользователя.
   *
   * Перед обновлением проверяет существование записи через `findOneByUser`.
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param id - UUID транзакции.
   * @param dto - Поля для обновления (все опциональны).
   * @returns Обновлённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  async updateByUser(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOneByUser(userId, id);
    const { date, ...rest } = dto;
    return this.prisma.transaction.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
  }

  /**
   * Удаляет транзакцию пользователя.
   *
   * Перед удалением проверяет существование записи через `findOneByUser`.
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param id - UUID транзакции.
   * @returns Удалённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  async removeByUser(userId: string, id: string) {
    await this.findOneByUser(userId, id);
    return this.prisma.transaction.delete({ where: { id } });
  }

  /**
   * Вычисляет суммарные доходы, расходы и баланс за период.
   *
   * Выполняет два агрегирующих запроса параллельно: по `INCOME` и `EXPENSE`.
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @param period - Фильтр по периоду.
   * @returns Объект `{ totalIncome, totalExpense, balance }` со значениями в числовом формате.
   */
  async aggregateByUser(userId: string, period: PeriodFilter) {
    const date = this.buildDateFilter(period);
    const where = { userId, ...(date ? { date } : {}) };

    const [incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...where, type: TransactionType.INCOME },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...where, type: TransactionType.EXPENSE },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount?.toNumber() ?? 0;
    const totalExpense = expenseAgg._sum.amount?.toNumber() ?? 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
