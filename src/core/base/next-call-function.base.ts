import { concatMap, from, Observable } from "rxjs";
import { Injectable } from "../decorators/injectable.decorator";
import { Request } from "../utils/types";
import { NextFunction, Response } from "express";

@Injectable()
export class NextCallFunction {
  observable: Observable<any>;
  constructor(
    req: Request,
    res: Response,
    next: NextFunction,
    ...use: ((req: Request, res: Response, next: NextFunction) => void)[]
  ) {
    this.observable = from(use).pipe(
      concatMap((middleware) => {
        return new Observable((subscriber) => {
          const result: any = middleware(req, res, next);
          if (result instanceof Promise) {
            result
              .then((data) => {
                subscriber.next(data);
                subscriber.complete();
              })
              .catch((error) => {
                subscriber.error(error);
              });
          }
        });
      })
    );
  }

  handle() {
    return this.observable;
  }
}
