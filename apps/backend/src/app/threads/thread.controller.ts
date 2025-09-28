import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Thread } from '@prisma/client';
import { ThreadService } from './thread.service';
import { UpdateThreadDto } from './UpdateThreadDto';
import { CreateThreadDto } from './CreateThreadDto';

@ApiTags('Thread')
@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiBody({ type: CreateThreadDto })
  @ApiResponse({ status: 201, description: 'Thread created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.threadService.create(createThreadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all threads or threads by user ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter threads by user ID' })
  @ApiResponse({ status: 200, description: 'List of threads' })
  async findAll(@Query('userId') userId?: string): Promise<Thread[]> {
    if (userId) {
      return this.threadService.findAllByUserId(userId);
    }
    return this.threadService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get thread by ID' })
  @ApiParam({ name: 'id', description: 'Thread ID' })
  @ApiResponse({ status: 200, description: 'Thread found' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async findOne(@Param('id') id: string): Promise<Thread> {
    return this.threadService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update thread by ID' })
  @ApiParam({ name: 'id', description: 'Thread ID' })
  @ApiBody({ type: UpdateThreadDto })
  @ApiResponse({ status: 200, description: 'Thread updated successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto): Promise<Thread> {
    return this.threadService.update(id, updateThreadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete thread by ID' })
  @ApiParam({ name: 'id', description: 'Thread ID' })
  @ApiResponse({ status: 204, description: 'Thread deleted successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.threadService.remove(id);
  }
}