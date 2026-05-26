import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { FindUserByIdQuery } from './queries/find-user-by-id.query';

@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { id: string } }) {
    return this.queryBus.execute(new FindUserByIdQuery(req.user.id));
  }
}
