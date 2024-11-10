import express, { Application, NextFunction, Response } from "express";
import { Constructor, Container } from "./di/container.di";
import { ExecuteHandlerMiddleware } from "./middlewares/execute-handler.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error.middleware";
import { BaseResponseFormatter } from "./middlewares/response-formatter.middleware";
import { NotFoundHandlerMiddleware } from "./middlewares/404-handler.middleware";
import { routeRegister } from "./routes/register.route";
import { combinePaths } from "./utils/common";
import { Request } from "./utils/types";

type TMiddleware = (
  | Constructor<any>
  | ((req: any, res: any, next: any) => void)
  | ((error: any, req: any, res: any, next: any) => void)
  | { forRoutes: string[]; useClass: Constructor<any> }
)[];

type TAppManager = {
  controllers?: Constructor<any>[];
  middlewares?: TMiddleware;
  interceptors?: TMiddleware;
  prefix?: string[];
  guards?: TMiddleware;
};

export class AppManager {
  controllers: Constructor<any>[];
  app: Application;
  container: Container;
  instances: any[];
  middlewares: TMiddleware;
  interceptors: TMiddleware;
  prefix: string;
  guards: TMiddleware;

  constructor({
    controllers,
    middlewares,
    interceptors,
    prefix,
    guards,
  }: TAppManager) {
    this.controllers = controllers ?? [];
    this.container = new Container();
    this.app = express();
    this.middlewares = middlewares ?? [];
    this.interceptors = interceptors ?? [];
    this.prefix = combinePaths(...(prefix ?? []));
    this.guards = guards ?? [];
  }

  init() {
    this.diRegister();
    this.applyMiddlewares(
      express.json(),
      express.urlencoded({ extended: true })
    );
    this.routeRegister();
    this.applyMiddlewares(NotFoundHandlerMiddleware);
    return this.app;
  }

  diRegister() {
    this.instances = this.controllers.map((controller) => {
      this.container.register(controller);
      return this.container.get(controller);
    });
  }

  routeRegister() {
    this.instances.forEach((instance) => {
      const routers = routeRegister(instance);
      routers.forEach((router) => {
        const path = combinePaths(this.prefix, router.path);
        this.app[router.method.toLowerCase() as keyof Application](
          path,
          router.middleware,
          this.getMiddlewares(...this.middlewares),
          this.getMiddlewares(...this.guards),
          this.getMiddlewares(ExecuteHandlerMiddleware),
          this.getMiddlewares(...this.interceptors),
          this.getMiddlewares(BaseResponseFormatter),
          (error: any, req: Request, res: Response, next: NextFunction) => {
            this.container.register(ErrorHandlerMiddleware);
            const instance = this.container.get(ErrorHandlerMiddleware);
            instance.use(error, req, res, next);
          }
        );
        console.log(`Đăng ký thành công route [${router.method}] ${path} `);
      });
    });
  }

  applyMiddlewares(...middlewares: TMiddleware) {
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        if (
          typeof middleware === "object" &&
          "forRoutes" in middleware &&
          "useClass" in middleware
        ) {
          this.container.register(middleware.useClass);
          const instance = this.container.get<any>(middleware.useClass);
          middleware.forRoutes.forEach((route) => {
            const path = combinePaths(this.prefix, route);
            this.app.use(path, instance.use.bind(instance));
          });
        } else {
          try {
            middleware = middleware as Constructor<any>;
            new middleware();
            this.container.register(middleware);
            const instance = this.container.get<any>(middleware);
            this.app.use(instance.use.bind(instance));
          } catch (error) {
            this.app.use(middleware as (req: any, res: any, next: any) => void);
          }
        }
      });
    }
  }

  getMiddlewares(...middlewares: TMiddleware) {
    if (middlewares && middlewares.length > 0) {
      return middlewares.map((middleware) => {
        if (
          typeof middleware === "object" &&
          "forRoutes" in middleware &&
          "useClass" in middleware
        ) {
          this.container.register(middleware.useClass);
          const instance = this.container.get<any>(middleware.useClass);
          return (req: Request, res: Response, next: NextFunction) => {
            middleware.forRoutes.forEach((route) => {
              const path = combinePaths(this.prefix, route);
              console.log(instance.constructor.name, req.route.path, path);
              if (req.route.path.startsWith(path)) {
                instance.use(req, res, next);
              } else next();
            });
          };
        } else {
          try {
            new (middleware as Constructor<any>)();
            this.container.register(middleware as Constructor<any>);
            const instance = this.container.get<any>(
              middleware as Constructor<any>
            );
            return instance.use.bind(instance);
          } catch (error) {
            return middleware;
          }
        }
      });
    }
    return [];
  }
}
