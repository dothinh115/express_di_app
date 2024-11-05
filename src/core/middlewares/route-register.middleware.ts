import { Response, NextFunction } from "express";
import { AppMiddleware } from "../base/middleware.base";
import { Request } from "../../utils/types";
import { Injectable } from "../../decorators/injectable.decorator";

@Injectable()
export class RouteRegisterMiddleware implements AppMiddleware {
  instance: any;
  handlerName: string;
  constructor(instance: any, handlerName: string) {
    this.instance = instance;
    this.handlerName = handlerName;
  }
  use(req: Request, res: Response, next: NextFunction) {
    const context = {
      instance: this.instance,
      handlerName: this.handlerName,
    };
    req.context = context;
    next();
  }
}
