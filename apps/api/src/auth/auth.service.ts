import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponse, JwtPayload } from '@repo/shared-types';
import * as bcrypt from 'bcryptjs';

import { CreateUserCommand } from '@/users/commands/create-user.command';
import { FindUserByEmailQuery } from '@/users/queries/find-user-by-email.query';
import { User } from '@repo/database/src/index';

import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.queryBus.execute<FindUserByEmailQuery, User | null>(
      new FindUserByEmailQuery(dto.email),
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(dto.email, passwordHash, dto.name),
    );
    return this.buildResponse(user.id, user.email, this.toUserDto(user));
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.queryBus.execute<FindUserByEmailQuery, User | null>(
      new FindUserByEmailQuery(dto.email),
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildResponse(user.id, user.email, this.toUserDto(user));
  }

  private buildResponse(
    sub: string,
    email: string,
    user: AuthResponse['user'],
  ): AuthResponse {
    const payload: JwtPayload = { sub, email };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  private toUserDto(user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
