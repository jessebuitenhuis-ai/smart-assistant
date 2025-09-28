import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Message } from '@prisma/client';
import { MessageService } from './message.service';
import { CreateMessageDto } from './CreateMessageDto';
import { UpdateMessageDto } from './UpdateMessageDto';

@ApiTags('Message')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages or messages by thread ID' })
  @ApiQuery({ name: 'threadId', required: false, description: 'Filter messages by thread ID' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async findAll(@Query('threadId') threadId?: string): Promise<Message[]> {
    if (threadId) {
      return this.messageService.findAllByThreadId(threadId);
    }
    return this.messageService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message found' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async findOne(@Param('id') id: string): Promise<Message> {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update message by ID' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto): Promise<Message> {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete message by ID' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.messageService.remove(id);
  }
}
