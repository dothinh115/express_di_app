import { Observable } from "rxjs";
import { Injectable } from "../decorators/injectable.decorator";
import { AppContext } from "./context.base";
import { NextCallFunction } from "./next-call-function.base";

@Injectable()
export class AppInterceptor {
  intercept(
    context: AppContext,
    next: NextCallFunction
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle();
  }
}
