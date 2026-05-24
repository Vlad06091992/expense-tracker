import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions.query-dto';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { ListTransactionsQuery } from './queries/list-transactions.query';
import { GetTransactionQuery } from './queries/get-transaction.query';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateTransactionDto) {
    return this.commandBus.execute(new CreateTransactionCommand(req.user.id, dto));
  }

  @Get()
  findAll(
    @Request() req: { user: { id: string } },
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.queryBus.execute(
      new ListTransactionsQuery(
        req.user.id,
        { month: query.month, year: query.year },
        { page: query.page ?? 1, limit: query.limit ?? 10 },
      ),
    );
  }

  @Get(':id')
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.queryBus.execute(new GetTransactionQuery(req.user.id, id));
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commandBus.execute(new UpdateTransactionCommand(req.user.id, id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteTransactionCommand(req.user.id, id));
  }
}
