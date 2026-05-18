import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByUser(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  async updateByUser(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOneByUser(userId, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async removeByUser(userId: string, id: string) {
    await this.findOneByUser(userId, id);
    return this.prisma.category.delete({ where: { id } });
  }
}
