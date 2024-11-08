import { Response, NextFunction } from "express";
import { Request } from "../utils/types";
import { AppMiddleware } from "../base/middleware.base";
import { Injectable } from "../decorators/injectable.decorator";
import { AppService } from "../app/app.service";

@Injectable()
export class NotFoundHandlerMiddleware implements AppMiddleware {
  routes: Set<string>;
  constructor(private app: AppService) {}

  use(req: Request, res: Response, next: NextFunction): void | Promise<void> {
    if (!req.route || !this.routes.has(req.route.path)) {
      res.status(404).send({
        message: "Not Found",
        statusCode: 404,
      });
    } else next();
  }

  onInit() {
    this.routes = new Set(
      this.app
        .getInstance()
        ._router.stack.map((middleware: any) => {
          if (middleware.route) {
            return middleware.route.path;
          }
          return undefined;
        })
        .filter((route: any) => route !== undefined)
    );
  }
}
