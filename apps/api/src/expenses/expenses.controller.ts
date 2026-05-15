import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCommand } from './commands/create-expense.command';
import { UpdateExpenseCommand } from './commands/update-expense.command';
import { DeleteExpenseCommand } from './commands/delete-expense.command';
import { ListExpensesQuery } from './queries/list-expenses.query';
import { GetExpenseQuery } from './queries/get-expense.query';

type AuthRequest = { user: { id: string } };

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.queryBus.execute(new ListExpensesQuery(req.user.id));
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.queryBus.execute(new GetExpenseQuery(req.user.id, id));
  }

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateExpenseDto) {
    return this.commandBus.execute(new CreateExpenseCommand(req.user.id, dto));
  }

  @Patch(':id')
  update(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.commandBus.execute(new UpdateExpenseCommand(req.user.id, id, dto));
  }

  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteExpenseCommand(req.user.id, id));
  }
}
