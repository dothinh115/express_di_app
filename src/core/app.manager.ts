import express, { Application, NextFunction, Response } from "express";
import { Constructor, Container } from "./di/container.di";
import { ExecuteHandlerMiddleware } from "./middlewares/execute-handler.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error.middleware";
import { BaseResponseFormatter } from "./middlewares/response-formatter.middleware";
import { NotFoundHandlerMiddleware } from "./middlewares/404-handler.middleware";
import { routeRegister } from "./routes/register.route";
import { combinePaths } from "./utils/common";
import { AppService } from "./app/app.service";
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
    this.container.register(AppService);
    this.app = this.container.get<AppService>(AppService).getInstance();
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
    this.applyMiddlewares(...this.middlewares);
    this.applyMiddlewares(...this.guards);
    this.applyMiddlewares(ExecuteHandlerMiddleware);
    this.applyMiddlewares(...this.interceptors);
    this.applyMiddlewares(BaseResponseFormatter);
    this.applyErrorMiddlewares(ErrorHandlerMiddleware);

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
          router.middleware
        );
        console.log(`Đăng ký thành công route [${router.method}] ${path} `);
      });
    });
  }

  applyErrorMiddlewares(...middlewares: TMiddleware) {
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        middleware = middleware as Constructor<any>;
        new middleware();
        this.container.register(middleware);
        const instance = this.container.get<any>(middleware);
        this.app.use(((
          error: any,
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          instance.use(error, req, res, next);
        }) as any);
      });
    }
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
}
