import { NextFunction, Response } from "express";
import { Request } from "../utils/types";

export class AppErrorMiddleware {
  use(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void | Promise<void> {}
}
