import { Response, NextFunction } from "express";
import { AppMiddleware } from "../core/base/middleware.base";
import { Injectable } from "../core/decorators/injectable.decorator";
import { Request } from "../core/utils/types";
import express from "express";
import path from "path";

@Injectable()
export class StaticMiddleware implements AppMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    return express.static(path.resolve("./uploads"))(req, res, next);
  }
}
