
import { ApiProperty } from '@nestjs/swagger';
import { MessageRole } from '@prisma/client';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can I help you today?'
  })
  content: string;

  @ApiProperty({
    description: 'Thread ID this message belongs to',
    example: 'thread-123'
  })
  threadId: string;

  @ApiProperty({
    description: 'Role of the message sender',
    enum: MessageRole,
    example: 'USER'
  })
  role: MessageRole;
}
