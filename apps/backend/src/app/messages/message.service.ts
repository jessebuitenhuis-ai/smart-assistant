import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Message, MessageRole } from '@prisma/client';
import { PrismaService } from '@smart-assistant/prisma';
import { CreateMessageDto } from './CreateMessageDto';
import { UpdateMessageDto } from './UpdateMessageDto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    // Validate required fields
    if (!createMessageDto.content || !createMessageDto.threadId || !createMessageDto.role) {
      throw new BadRequestException('Content, threadId, and role are required');
    }

    if (createMessageDto.content.trim().length === 0) {
      throw new BadRequestException('Content cannot be empty');
    }

    // Validate role
    const validRoles = Object.values(MessageRole);
    if (!validRoles.includes(createMessageDto.role)) {
      throw new BadRequestException('Invalid role. Must be USER, ASSISTANT, or SYSTEM');
    }

    // Validate that thread exists
    try {
      await this.prisma.thread.findUniqueOrThrow({
        where: { id: createMessageDto.threadId },
      });
    } catch (error) {
      throw new BadRequestException(`Thread with ID ${createMessageDto.threadId} not found`);
    }

    try {
      return await this.prisma.message.create({
        data: createMessageDto,
        include: {
          thread: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(`Thread with ID ${createMessageDto.threadId} not found`);
        }
      }
      throw new BadRequestException('Failed to create message');
    }
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
    // Don't validate thread existence for filtering - just return empty array if thread doesn't exist
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
    // Validate content if being updated
    if (updateMessageDto.content !== undefined && updateMessageDto.content.trim().length === 0) {
      throw new BadRequestException('Content cannot be empty');
    }

    // Validate role if being updated
    if (updateMessageDto.role !== undefined) {
      const validRoles = Object.values(MessageRole);
      if (!validRoles.includes(updateMessageDto.role)) {
        throw new BadRequestException('Invalid role. Must be USER, ASSISTANT, or SYSTEM');
      }
    }

    try {
      return await this.prisma.message.update({
        where: { id },
        data: updateMessageDto,
        include: {
          thread: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Message with ID ${id} not found`);
        }
      }
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.message.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Message with ID ${id} not found`);
        }
      }
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
