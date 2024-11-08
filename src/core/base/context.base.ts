import { NextFunction, Response } from "express";
import { Injectable } from "../decorators/injectable.decorator";
import { Constructor } from "../di/container.di";
import { Request } from "../utils/types";

@Injectable()
export class AppContext {
  private controllerClass: Constructor<any>;
  private handler: Function;
  private request: Request;
  private response: Response;
  private next: NextFunction;
  private params: any;

  constructor(req: Request, res: Response, next: NextFunction) {
    this.controllerClass = req.context.instance.constructor ?? undefined;
    this.handler = req.context.instance[req.context.handlerName] ?? undefined;
    this.request = req;
    this.response = res;
    this.next = next;
    this.params = req.context.params ?? undefined;
  }

  switchToHttpRequest() {
    return this.request;
  }

  switchToHttpReponse() {
    return this.response;
  }

  getClass() {
    return this.controllerClass;
  }

  getHandler() {
    return this.handler;
  }

  getNextFunction() {
    return this.next;
  }

  getParams() {
    return this.params;
  }
}
