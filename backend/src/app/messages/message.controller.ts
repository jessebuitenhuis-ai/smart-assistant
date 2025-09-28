import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessageService } from './message.service';
import { CreateMessageDto } from './CreateMessageDto';
import { UpdateMessageDto } from './UpdateMessageDto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  async findAll(@Query('threadId') threadId?: string): Promise<Message[]> {
    if (threadId) {
      return this.messageService.findAllByThreadId(threadId);
    }
    return this.messageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Message> {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto): Promise<Message> {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.messageService.remove(id);
  }
}
