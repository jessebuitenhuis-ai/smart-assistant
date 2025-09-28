import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Thread } from '@prisma/client';
import { ThreadService } from './thread.service';
import { UpdateThreadDto } from './UpdateThreadDto';
import { CreateThreadDto } from './CreateThreadDto';

@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.threadService.create(createThreadDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string): Promise<Thread[]> {
    if (userId) {
      return this.threadService.findAllByUserId(userId);
    }
    return this.threadService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Thread> {
    return this.threadService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto): Promise<Thread> {
    return this.threadService.update(id, updateThreadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.threadService.remove(id);
  }
}