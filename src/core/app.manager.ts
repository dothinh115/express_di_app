import express, { Application, NextFunction, Response } from "express";
import { Constructor, Container } from "./di/container.di";
import { ExecuteHandlerMiddleware } from "./middlewares/execute-handler.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error.middleware";
import { BaseResponseFormatter } from "./middlewares/response-formatter.middleware";
import { NotFoundHandlerMiddleware } from "./middlewares/404-handler.middleware";
import { routeRegister } from "./routes/register.route";
import { combinePaths, defaultMethods } from "./utils/common";
import { Request, TGateway } from "./utils/types";
import { getMetadata } from "./metadata/metadata";
import {
  METHOD_METADATA_KEY,
  SOCKET_GATEWAY_METADATA_KEY,
  SUBSCRIBE_MESSAGE_METADATA_KEY,
} from "./utils/constant";
import http from "http";
import { Server, Socket } from "socket.io";
import { UnAuthorizedException } from "./base/error.base";

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
  private controllers: Constructor<any>[];
  private app: Application;
  private container: Container;
  private restfulInstances: any[] = [];
  private gatewayInstances: any[] = [];
  private middlewares: TMiddleware;
  private interceptors: TMiddleware;
  private prefix: string;
  private guards: TMiddleware;
  private servers = new Map<number, http.Server>();

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
    this.applyMiddlewares(
      express.json(),
      express.urlencoded({ extended: true })
    );
    this.instanceRegister();
    this.routeRegister();
    this.applyMiddlewares(NotFoundHandlerMiddleware);
    return this;
  }

  private diRegister(constructor: Constructor<any>) {
    this.container.register(constructor);
    return this.container.get(constructor);
  }

  instanceRegister() {
    this.controllers.forEach((controller) => {
      const controllerPath = getMetadata(METHOD_METADATA_KEY, controller);
      const instance = this.diRegister(controller);
      if (controllerPath !== undefined) {
        this.restfulInstances.push(instance);
      } else {
        this.gatewayInstances.push(instance);
      }
    });
  }

  private routeRegister() {
    this.restfulInstances.forEach((instance) => {
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
            const instance = this.diRegister(ErrorHandlerMiddleware);
            instance.use(error, req, res, next);
          }
        );
        console.log(`Đăng ký thành công route [${router.method}] ${path} `);
      });
    });
  }

  private applyMiddlewares(...middlewares: TMiddleware) {
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        if (
          typeof middleware === "object" &&
          "forRoutes" in middleware &&
          "useClass" in middleware
        ) {
          const instance = this.diRegister(middleware.useClass);
          middleware.forRoutes.forEach((route) => {
            const path = combinePaths(this.prefix, route);
            this.app.use(path, instance.use.bind(instance));
          });
        } else {
          try {
            middleware = middleware as Constructor<any>;
            new middleware();
            const instance = this.diRegister(middleware);
            this.app.use(instance.use.bind(instance));
          } catch (error) {
            this.app.use(middleware as (req: any, res: any, next: any) => void);
          }
        }
      });
    }
  }

  private getMiddlewares(...middlewares: TMiddleware) {
    if (middlewares && middlewares.length > 0) {
      return middlewares.map((middleware) => {
        if (
          typeof middleware === "object" &&
          "forRoutes" in middleware &&
          "useClass" in middleware
        ) {
          const instance = this.diRegister(middleware.useClass);
          return (req: Request, res: Response, next: NextFunction) => {
            middleware.forRoutes.forEach((route) => {
              const path = combinePaths(this.prefix, route);
              if (req.route.path.startsWith(path)) {
                instance.use(req, res, next);
              } else next();
            });
          };
        } else {
          try {
            new (middleware as Constructor<any>)();
            const instance = this.diRegister(middleware as Constructor<any>);
            return instance.use.bind(instance);
          } catch (error) {
            return middleware;
          }
        }
      });
    }
    return [];
  }

  gatewayRegister(port: number) {
    this.gatewayInstances.forEach((instance) => {
      const gatewayOptions: TGateway = getMetadata(
        SOCKET_GATEWAY_METADATA_KEY,
        instance.constructor
      );
      if (!gatewayOptions) {
        return;
      }
      let socketServer: http.Server;
      const targetPort = gatewayOptions.port ?? port;
      if (this.servers.has(targetPort)) {
        socketServer = this.servers.get(targetPort)!;
      } else {
        socketServer = http.createServer();
        this.servers.set(targetPort, socketServer);
        socketServer.listen(targetPort);
      }
      const io = new Server(socketServer, {
        cors: gatewayOptions.cors ?? {
          origin: "*",
        },
      });
      const namespace = io.of(gatewayOptions.namespace ?? "/");
      namespace.use((socket: Socket, next: any) => {
        if (typeof instance.handleHandshake === "function") {
          const isAuthenticated = instance.handleHandshake(socket);
          if (!isAuthenticated) {
            return next(new UnAuthorizedException());
          }
          return next();
        } else return next();
      });

      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(instance)
      ).filter((method) => !defaultMethods.includes(method));

      namespace.on("connection", (socket) => {
        methods.forEach((method) => {
          const message = getMetadata(
            SUBSCRIBE_MESSAGE_METADATA_KEY,
            instance[method]
          );
          if (!message) {
            return;
          }
          socket.on(message, (data: any) => {
            instance[method](socket, data);
          });
        });
      });
    });
  }

  use(
    path: string = "/",
    middleware: (req: any, res: Response, next: NextFunction) => void
  ) {
    this.app.use(path, middleware);
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer(this.app);
    this.servers.set(port, server);
    server.listen(port, callback);

    this.gatewayRegister(port);
  }
}
