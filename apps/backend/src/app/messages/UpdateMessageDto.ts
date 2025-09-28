
import { MessageRole } from '@prisma/client';

export interface UpdateMessageDto {
  content?: string;
  role?: MessageRole;
}
