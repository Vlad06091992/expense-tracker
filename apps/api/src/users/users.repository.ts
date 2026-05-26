import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@repo/database/src/index';

import { PrismaService } from '@/prisma/prisma.service';

/** Инкапсулирует все запросы к таблице User через Prisma. */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Возвращает пользователя по id или null, если не найден. */
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /** Возвращает пользователя по email или null, если не найден. */
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** Создаёт нового пользователя и возвращает созданную запись. */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
