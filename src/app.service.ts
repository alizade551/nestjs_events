import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    @Inject('APP_NAME')
    private readonly app_name: string,
  ) {}
  getHello(): string {
    return `Hello World form ${this.app_name}!`;
  }
}
