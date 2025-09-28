
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateThreadDto {
  @ApiPropertyOptional({
    description: 'Thread title',
    example: 'My updated conversation with AI'
  })
  title?: string;
}
