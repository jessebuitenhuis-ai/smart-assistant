
import { ApiProperty } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({
    description: 'Thread title',
    example: 'My conversation with AI'
  })
  title: string;

  @ApiProperty({
    description: 'User ID who owns this thread',
    example: 'user-123'
  })
  userId: string;
}
