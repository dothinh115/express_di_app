import express, { Application } from "express";
import { Constructor, Container } from "./di/container.di";
import { ExecuteHandlerMiddleware } from "./middlewares/execute-handler.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error.middleware";
import { BaseResponseFormatter } from "./middlewares/response-formatter.middleware";
import { NotFoundHandlerMiddleware } from "./middlewares/404-handler.middleware";
import { routeRegister } from "./routes/register.route";

type TAppManager = {
  controllers?: Constructor<any>[];
  middlewares?: any[];
  interceptors?: any[];
};

export class AppManager {
  controllers: Constructor<any>[];
  app: Application;
  container: Container;
  instances: any[];
  middlewares: any[];
  interceptors: any[];

  constructor({ controllers, middlewares, interceptors }: TAppManager) {
    this.controllers = controllers ?? [];
    this.app = express();
    this.container = new Container();
    this.middlewares = middlewares ?? [];
    this.interceptors = interceptors ?? [];
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
      this.app.use(router);
    });
  }

  applyMiddlewares(...middlewares: any[]) {
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        try {
          new middleware();
          this.container.register(middleware);
          const instance = this.container.get<any>(middleware);
          this.app.use(instance.use.bind(instance));
        } catch (error) {
          this.app.use(middleware);
        }
      });
    }
  }
}
