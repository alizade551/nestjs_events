import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(5, 15)
  username: string;
  @IsEmail()
  email: string;
  @Length(8)
  password: string;
  @Length(8)
  retypedPassword: string;
  @Length(2)
  firstName: string;
  @Length(2)
  lastName: string;
}
