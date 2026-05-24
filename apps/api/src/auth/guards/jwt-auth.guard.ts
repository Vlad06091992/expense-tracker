import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для защиты маршрутов с помощью JWT.
 *
 * Применяет стратегию `'jwt'` (см. {@link JwtStrategy}).
 * Возвращает `401 Unauthorized`, если токен отсутствует, истёк или недействителен.
 * Записывает результат валидации (`{ id, email }`) в `req.user`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
