import { Injectable } from "../decorators/injectable.decorator";

@Injectable()
export class AppPipes {
  transform(value: any, type: any): any | Promise<any> {}
}
