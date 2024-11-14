import { Injectable } from "../decorators/injectable.decorator";
import { AppContext } from "./context.base";

@Injectable()
export class AppPipes {
  transform(value: any, type: any): any | Promise<any> {}
}
