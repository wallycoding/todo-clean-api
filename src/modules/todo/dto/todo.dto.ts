// http://localhost:3000/api

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, Length, ValidateIf } from 'class-validator';

export class TodoWriteDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 1000)
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  done: boolean;
}

export class TodoUpdateDTO {
  @ApiProperty()
  @ValidateIf((o) => typeof o.done === 'undefined')
  @IsNotEmpty()
  @Length(3, 1000)
  content?: string;

  @ApiProperty()
  @ValidateIf((o) => typeof o.content === 'undefined')
  @IsNotEmpty()
  @IsBoolean()
  done?: boolean;
}
