
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com'
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe'
  })
  name?: string;
}
