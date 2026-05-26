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
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryCommand } from './commands/create-category.command';
import { UpdateCategoryCommand } from './commands/update-category.command';
import { DeleteCategoryCommand } from './commands/delete-category.command';
import { ListCategoriesQuery } from './queries/list-categories.query';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(new CreateCategoryCommand(req.user.id, dto));
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.queryBus.execute(new ListCategoriesQuery(req.user.id));
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(new UpdateCategoryCommand(req.user.id, id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteCategoryCommand(req.user.id, id));
  }
}
