import { Observable } from "rxjs";
import { AppContext } from "../core/base/context.base";
import { AppInterceptor } from "../core/base/interceptor.base";
import { NextCallFunction } from "../core/base/next-call-function.base";
import { Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class BodyValidateInterceptor implements AppInterceptor {
  async intercept(
    context: AppContext,
    next: NextCallFunction
  ): Promise<Observable<any>> {
    const req = context.switchToHttpRequest();
    let body = req.body;

    return next.handle();
  }
}
