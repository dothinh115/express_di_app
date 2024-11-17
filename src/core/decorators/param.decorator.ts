import { NextFunction, Response } from "express";
import { PARAM_METADATA_KEY } from "../utils/constant";
import { Request } from "../utils/types";
import { setMetadata } from "../metadata/metadata";
import { AppContext } from "../base/context.base";

export const Inject = (value: any): ParameterDecorator =>
  setMetadata(PARAM_METADATA_KEY, value);

export const Body = (): ParameterDecorator =>
  createParamDecorator((context) => {
    const req = context.switchToHttpRequest();
    return req.body;
  });

export const Req = (): ParameterDecorator =>
  createParamDecorator((context) => context.switchToHttpRequest());

export const Res = (): ParameterDecorator =>
  createParamDecorator((context) => context.switchToHttpReponse());

export const Param = (field: string): ParameterDecorator =>
  createParamDecorator((context) => {
    const req = context.switchToHttpRequest();
    return req.params[field];
  });

export const createParamDecorator = (handler: (context: AppContext) => any) =>
  setMetadata(
    PARAM_METADATA_KEY,
    (req: Request, res: Response, next: NextFunction) => {
      const context = new AppContext(req, res, next);
      return handler(context);
    }
  );
