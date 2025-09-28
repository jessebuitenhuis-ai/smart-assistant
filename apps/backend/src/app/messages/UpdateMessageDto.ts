
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MessageRole } from '@prisma/client';

export class UpdateMessageDto {
  @ApiPropertyOptional({
    description: 'Message content',
    example: 'Hello, how can I help you today?'
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Role of the message sender',
    enum: MessageRole,
    example: 'USER'
  })
  role?: MessageRole;
}
