import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './CreateMessageDto';
import { UpdateMessageDto } from './UpdateMessageDto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    // Validate that thread exists
    await this.prisma.thread.findUniqueOrThrow({
      where: { id: createMessageDto.threadId },
    }).catch(() => {
      throw new NotFoundException(`Thread with ID ${createMessageDto.threadId} not found`);
    });

    return this.prisma.message.create({
      data: createMessageDto,
      include: {
        thread: true,
      },
    });
  }

  async findAll(): Promise<Message[]> {
    return this.prisma.message.findMany({
      include: {
        thread: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findAllByThreadId(threadId: string): Promise<Message[]> {
    // Validate that thread exists
    await this.prisma.thread.findUniqueOrThrow({
      where: { id: threadId },
    }).catch(() => {
      throw new NotFoundException(`Thread with ID ${threadId} not found`);
    });

    return this.prisma.message.findMany({
      where: { threadId },
      include: {
        thread: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        thread: true,
      },
    });
    
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    
    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    try {
      return await this.prisma.message.update({
        where: { id },
        data: updateMessageDto,
        include: {
          thread: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.message.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
