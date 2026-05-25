import { NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesRepository', () => {
  let repo: CategoriesRepository;
  let prisma: { category: Record<string, jest.Mock> };

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repo = new CategoriesRepository(prisma as unknown as PrismaService);
  });

  describe('findAllByUser', () => {
    it('should call findMany with correct args and return result', async () => {
      const categories = [{ id: '1', name: 'Food', userId: 'u1', createdAt: new Date() }];
      prisma.category.findMany.mockResolvedValue(categories);

      const result = await repo.findAllByUser('u1');

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(categories);
    });

    it('should return empty array when user has no categories', async () => {
      prisma.category.findMany.mockResolvedValue([]);

      const result = await repo.findAllByUser('u1');

      expect(result).toEqual([]);
    });
  });

  describe('findOneByUser', () => {
    it('should return category when found', async () => {
      const category = { id: '1', name: 'Food', userId: 'u1' };
      prisma.category.findFirst.mockResolvedValue(category);

      const result = await repo.findOneByUser('u1', '1');

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: 'u1' },
      });
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(repo.findOneByUser('u1', 'missing-id')).rejects.toThrow(NotFoundException);
      await expect(repo.findOneByUser('u1', 'missing-id')).rejects.toThrow('Category not found');
    });
  });

  describe('create', () => {
    it('should call create with userId merged into dto and return result', async () => {
      const dto: CreateCategoryDto = { name: 'Transport', color: '#ff0000' };
      const created = { id: 'new-id', ...dto, userId: 'u1', createdAt: new Date() };
      prisma.category.create.mockResolvedValue(created);

      const result = await repo.create('u1', dto);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'u1' },
      });
      expect(result).toEqual(created);
    });

    it('should work with optional fields omitted', async () => {
      const dto: CreateCategoryDto = { name: 'Health' };
      const created = { id: 'new-id', name: 'Health', userId: 'u1', color: null, icon: null, createdAt: new Date() };
      prisma.category.create.mockResolvedValue(created);

      const result = await repo.create('u1', dto);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Health', userId: 'u1' },
      });
      expect(result).toEqual(created);
    });
  });

  describe('updateByUser', () => {
    it('should find category first, then update and return result', async () => {
      const existing = { id: '1', name: 'Food', userId: 'u1' };
      const dto: UpdateCategoryDto = { name: 'Updated Food' };
      const updated = { ...existing, ...dto };
      prisma.category.findFirst.mockResolvedValue(existing);
      prisma.category.update.mockResolvedValue(updated);

      const result = await repo.updateByUser('u1', '1', dto);

      expect(prisma.category.findFirst).toHaveBeenCalledWith({ where: { id: '1', userId: 'u1' } });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when category not found and not call update', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(repo.updateByUser('u1', 'missing', { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(prisma.category.update).not.toHaveBeenCalled();
    });
  });

  describe('removeByUser', () => {
    it('should find category first, then delete and return deleted record', async () => {
      const existing = { id: '1', name: 'Food', userId: 'u1' };
      prisma.category.findFirst.mockResolvedValue(existing);
      prisma.category.delete.mockResolvedValue(existing);

      const result = await repo.removeByUser('u1', '1');

      expect(prisma.category.findFirst).toHaveBeenCalledWith({ where: { id: '1', userId: 'u1' } });
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(existing);
    });

    it('should throw NotFoundException when category not found and not call delete', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(repo.removeByUser('u1', 'missing')).rejects.toThrow(NotFoundException);
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });
});
