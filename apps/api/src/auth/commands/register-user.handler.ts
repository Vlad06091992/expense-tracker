import { ConflictException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { User } from '@repo/database/src/index';
import type { AuthResponse } from '@repo/shared-types';
import * as bcrypt from 'bcryptjs';

import { buildAuthResponse } from '../utils/build-auth-response';

import { RegisterUserCommand } from './register-user.command';

import { CreateUserCommand } from '@/users/commands/create-user.command';
import { FindUserByEmailQuery } from '@/users/queries/find-user-by-email.query';


@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, AuthResponse> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResponse> {
    const existing = await this.queryBus.execute<FindUserByEmailQuery, User | null>(
      new FindUserByEmailQuery(command.email),
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(command.password, 10);
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(command.email, passwordHash, command.name),
    );
    return buildAuthResponse(user, this.jwtService);
  }
}
