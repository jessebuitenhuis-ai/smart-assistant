import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Thread } from '@prisma/client';
import { PrismaService } from '@smart-assistant/prisma';
import { CreateThreadDto } from './CreateThreadDto';
import { UpdateThreadDto } from './UpdateThreadDto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ThreadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    // Validate required fields
    if (!createThreadDto.title || !createThreadDto.userId) {
      throw new BadRequestException('Title and userId are required');
    }

    if (createThreadDto.title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    // Validate that user exists
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id: createThreadDto.userId },
      });
    } catch (error) {
      throw new BadRequestException(`User with ID ${createThreadDto.userId} not found`);
    }

    try {
      return await this.prisma.thread.create({
        data: createThreadDto,
        include: {
          user: true,
          messages: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(`User with ID ${createThreadDto.userId} not found`);
        }
      }
      throw new BadRequestException('Failed to create thread');
    }
  }

  async findAll(): Promise<Thread[]> {
    return this.prisma.thread.findMany({
      include: {
        user: true,
        messages: true,
      },
    });
  }

  async findAllByUserId(userId: string): Promise<Thread[]> {
    // Don't validate user existence for filtering - just return empty array if user doesn't exist
    return this.prisma.thread.findMany({
      where: { userId },
      include: {
        user: true,
        messages: true,
      },
    });
  }

  async findOne(id: string): Promise<Thread> {
    const thread = await this.prisma.thread.findUnique({
      where: { id },
      include: {
        user: true,
        messages: true,
      },
    });
    
    if (!thread) {
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }
    
    return thread;
  }

  async update(id: string, updateThreadDto: UpdateThreadDto): Promise<Thread> {
    // Validate title if being updated
    if (updateThreadDto.title !== undefined && updateThreadDto.title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    // Note: userId is not updatable in this DTO, so no validation needed

    try {
      return await this.prisma.thread.update({
        where: { id },
        data: updateThreadDto,
        include: {
          user: true,
          messages: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Thread with ID ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Foreign key constraint violation');
        }
      }
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.thread.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Thread with ID ${id} not found`);
        }
      }
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }
  }
}
