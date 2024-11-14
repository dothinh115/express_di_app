import { Injectable } from "../core/decorators/injectable.decorator";
import { AppInterceptor } from "../core/base/interceptor.base";
import { map, Observable } from "rxjs";
import { AppContext } from "../core/base/context.base";
import { NextCallFunction } from "../core/base/next-call-function.base";

@Injectable()
export class BaseResponseFormatter implements AppInterceptor {
  intercept(context: AppContext, next: NextCallFunction): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        message: "Thành công",
        data,
        statusCode: 200,
      }))
    );
  }
}
