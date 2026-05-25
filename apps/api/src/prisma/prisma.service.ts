import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/database';

/**
 * NestJS-обёртка над `PrismaClient`.
 *
 * Зарегистрирован как глобальный провайдер в `PrismaModule`,
 * поэтому доступен для инъекции в любом модуле без дополнительного импорта.
 */
@Injectable()
export class PrismaService extends PrismaClient {
  /**
   * Устанавливает соединение с базой данных при инициализации модуля.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Закрывает соединение с базой данных при уничтожении модуля.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
