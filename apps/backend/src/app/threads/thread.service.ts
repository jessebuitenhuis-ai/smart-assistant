import { Injectable, NotFoundException } from '@nestjs/common';
import { Thread } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThreadDto } from './CreateThreadDto';
import { UpdateThreadDto } from './UpdateThreadDto';

@Injectable()
export class ThreadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    // Validate that user exists
    await this.prisma.user.findUniqueOrThrow({
      where: { id: createThreadDto.userId },
    }).catch(() => {
      throw new NotFoundException(`User with ID ${createThreadDto.userId} not found`);
    });

    return this.prisma.thread.create({
      data: createThreadDto,
      include: {
        user: true,
        messages: true,
      },
    });
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
    // Validate that user exists
    await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }).catch(() => {
      throw new NotFoundException(`User with ID ${userId} not found`);
    });

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
    try {
      return await this.prisma.thread.update({
        where: { id },
        data: updateThreadDto,
        include: {
          user: true,
          messages: true,
        },
      });
    } catch {
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.thread.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }
  }
}
