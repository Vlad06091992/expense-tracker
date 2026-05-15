import { JwtService } from '@nestjs/jwt';
import type { AuthResponse, JwtPayload } from '@repo/shared-types';
import { User } from '@repo/database/src/index';

export function buildAuthResponse(user: User, jwtService: JwtService): AuthResponse {
  const payload: JwtPayload = { sub: user.id, email: user.email };
  return {
    accessToken: jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  };
}
