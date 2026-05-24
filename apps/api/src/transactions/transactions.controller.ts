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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions.query-dto';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { ListTransactionsQuery } from './queries/list-transactions.query';
import { GetTransactionQuery } from './queries/get-transaction.query';

/**
 * REST-контроллер для управления транзакциями текущего пользователя.
 *
 * Все маршруты защищены `JwtAuthGuard`. Делегирует операции
 * в `CommandBus` (мутации) и `QueryBus` (чтение) согласно паттерну CQRS.
 */
@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую транзакцию для аутентифицированного пользователя.
   *
   * @param req - HTTP-запрос с JWT-payload (`req.user.id`).
   * @param dto - Данные новой транзакции.
   * @returns Созданная транзакция.
   */
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 201, description: 'Транзакция успешно создана.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @Post()
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateTransactionDto) {
    return this.commandBus.execute(new CreateTransactionCommand(req.user.id, dto));
  }

  /**
   * Возвращает постраничный список транзакций с агрегированным резюме.
   *
   * @param req - HTTP-запрос с JWT-payload (`req.user.id`).
   * @param query - Параметры фильтрации по периоду и пагинации.
   * @returns Объект `{ items, summary, meta }` — список транзакций, итоги по доходам/расходам и метаданные пагинации.
   */
  @ApiOperation({ summary: 'Список транзакций с пагинацией и агрегатами' })
  @ApiResponse({ status: 200, description: 'Список транзакций с метаданными и итогами.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
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

  /**
   * Возвращает одну транзакцию по идентификатору.
   *
   * @param req - HTTP-запрос с JWT-payload (`req.user.id`).
   * @param id - UUID транзакции.
   * @returns Найденная транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiResponse({ status: 200, description: 'Транзакция найдена.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена.' })
  @Get(':id')
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.queryBus.execute(new GetTransactionQuery(req.user.id, id));
  }

  /**
   * Частично обновляет транзакцию.
   *
   * @param req - HTTP-запрос с JWT-payload (`req.user.id`).
   * @param id - UUID транзакции.
   * @param dto - Поля для обновления (все опциональны).
   * @returns Обновлённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiResponse({ status: 200, description: 'Транзакция успешно обновлена.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена.' })
  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commandBus.execute(new UpdateTransactionCommand(req.user.id, id, dto));
  }

  /**
   * Удаляет транзакцию. Возвращает HTTP 204 без тела ответа.
   *
   * @param req - HTTP-запрос с JWT-payload (`req.user.id`).
   * @param id - UUID транзакции.
   * @returns `void`
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiResponse({ status: 204, description: 'Транзакция удалена.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteTransactionCommand(req.user.id, id));
  }
}
