import { NextFunction, Response } from "express";
import { Request } from "../../utils/types";

export class AppMiddleware {
  use(req: Request, res: Response, next: NextFunction) {}
}
