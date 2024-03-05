import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppTurkishService {
  constructor(
    @Inject('APP_NAME')
    private readonly app_name: string,
    @Inject('MESSAGE')
    private readonly message: string,
  ) {}

  getHello(): string {
    console.log(process.env.DB_HOST);
    return `Selam dunya nerden ${this.app_name}  ${this.message}`;
  }
}
