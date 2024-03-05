import { IsString, Length, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Length(5, 255)
  name: string;
  @Length(5, 255)
  description: string;
  @IsDateString()
  when: string;
  @Length(5, 255)
  address: string;
}
