import { QueryBus } from '@nestjs/cqrs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { JwtPayload } from '@repo/shared-types';
import { User } from '@repo/database/src/index';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { FindUserByIdQuery } from '../../users/queries/find-user-by-id.query';

/**
 * Passport-стратегия для валидации JWT из заголовка `Authorization: Bearer <token>`.
 *
 * При каждом запросе перечитывает пользователя из БД по `payload.sub`,
 * чтобы отклонить токены удалённых или заблокированных аккаунтов.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly queryBus: QueryBus,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Вызывается Passport после успешной проверки подписи токена.
   *
   * @param payload - Декодированный JWT-payload (`sub` — userId, `email`).
   * @returns Объект `{ id, email }`, записываемый в `req.user`.
   * @throws {UnauthorizedException} Если пользователь не найден в базе данных.
   */
  async validate(payload: JwtPayload) {
    const user = await this.queryBus.execute<FindUserByIdQuery, User | null>(new FindUserByIdQuery(payload.sub));
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email };
  }
}
