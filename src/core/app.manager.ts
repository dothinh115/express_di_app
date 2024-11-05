import express, { Application } from "express";
import { Constructor, Container } from "./di/container.di";
import { ExecuteHandlerMiddleware } from "./middlewares/execute-handler.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error.middleware";
import { BaseResponseFormatter } from "./middlewares/response-formatter.middleware";
import { NotFoundHandlerMiddleware } from "./middlewares/404-handler.middleware";
import { routeRegister } from "./routes/register.route";
import { combinePaths } from "../utils/common";

type TMiddleware = (
  | Constructor<any>
  | ((req: any, res: any, next: any) => void)
  | { provide: string; useClass: Constructor<any> }
)[];

type TAppManager = {
  controllers?: Constructor<any>[];
  middlewares?: TMiddleware;
  interceptors?: any[];
  prefix?: string[];
};

export class AppManager {
  controllers: Constructor<any>[];
  app: Application;
  container: Container;
  instances: TMiddleware;
  middlewares: any[];
  interceptors: any[];
  prefix: string;

  constructor({ controllers, middlewares, interceptors, prefix }: TAppManager) {
    this.controllers = controllers ?? [];
    this.app = express();
    this.container = new Container();
    this.middlewares = middlewares ?? [];
    this.interceptors = interceptors ?? [];
    this.prefix = combinePaths(...(prefix ?? []));
  }

  init() {
    this.diRegister();
    this.applyMiddlewares(
      express.json(),
      express.urlencoded({ extended: true })
    );
    this.applyMiddlewares(...this.middlewares);
    this.routeRegister();
    this.applyMiddlewares(ExecuteHandlerMiddleware);
    this.applyMiddlewares(...this.interceptors);
    this.applyMiddlewares(BaseResponseFormatter);
    this.applyMiddlewares(ErrorHandlerMiddleware);
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
      const router = routeRegister(instance);
      this.app.use(this.prefix, router);
    });
  }

  applyMiddlewares(...middlewares: TMiddleware) {
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        if (
          typeof middleware === "object" &&
          "provide" in middleware &&
          "useClass" in middleware
        ) {
          this.container.register(middleware.useClass);
          const instance = this.container.get<any>(middleware.useClass);
          const path = combinePaths(
            this.prefix !== "/" ? this.prefix : "",
            middleware.provide
          );
          this.app.use(path, instance.use.bind(instance));
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
