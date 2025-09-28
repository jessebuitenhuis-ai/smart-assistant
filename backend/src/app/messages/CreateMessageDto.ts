
import { MessageRole } from '@prisma/client';

export interface CreateMessageDto {
  content: string;
  threadId: string;
  role: MessageRole;
}
