import express, { Application, NextFunction, Response } from "express";
import { Constructor, Container } from "./di/container.di";
import { ExecuteHandlerMiddleware } from "./middlewares/execute-handler.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error.middleware";
import { NotFoundHandlerMiddleware } from "./middlewares/404-handler.middleware";
import { routeRegister } from "./routes/register.route";
import { combinePaths, defaultMethods } from "./utils/common";
import { Request, TGateway } from "./utils/types";
import { getMetadata } from "./metadata/metadata";
import {
  METHOD_METADATA_KEY,
  SOCKET_GATEWAY_METADATA_KEY,
  SUBSCRIBE_MESSAGE_METADATA_KEY,
  USE_PIPES_METADATA_KEY,
} from "./utils/constant";
import http from "http";
import { Server, Socket } from "socket.io";
import { UnAuthorizedException } from "./base/error.base";
import { NextCallFunction } from "./base/next-call-function.base";
import { AppContext } from "./base/context.base";

type TMiddleware = (
  | Constructor<any>
  | ((req: any, res: any, next: any) => void)
  | ((error: any, req: any, res: any, next: any) => void)
  | { forRoutes: string[]; useClass: Constructor<any> }
)[];

type TInterceptor = (
  | Constructor<any>
  | { forRoutes: string[]; useClass: Constructor<any> }
)[];

type TPipe = (
  | Constructor<any>
  | { forRoutes: string[]; useClass: Constructor<any> }
)[];

type TAppManager = {
  controllers?: Constructor<any>[];
  middlewares?: TMiddleware;
  interceptors?: TInterceptor;
  prefix?: string[];
  guards?: TMiddleware;
  pipes?: TPipe;
};

export class AppManager {
  private controllers: Constructor<any>[];
  private app: Application;
  private container: Container;
  private restfulInstances: any[] = [];
  private gatewayInstances: any[] = [];
  private middlewares: TMiddleware;
  private interceptors: TInterceptor;
  private prefix: string;
  private guards: TMiddleware;
  private servers = new Map<number, http.Server>();
  private pipes: TPipe;

  constructor({
    controllers,
    middlewares,
    interceptors,
    prefix,
    guards,
    pipes,
  }: TAppManager) {
    this.controllers = controllers ?? [];
    this.container = new Container();
    this.app = express();
    this.middlewares = middlewares ?? [];
    this.interceptors = interceptors ?? [];
    this.prefix = combinePaths(...(prefix ?? []));
    this.guards = guards ?? [];
    this.pipes = pipes ?? [];
  }

  async init() {
    this.applyMiddlewares(express.urlencoded({ extended: true }));

    this.useGlobalPipes();
    this.instanceRegister();
    this.routeRegister();
    this.applyMiddlewares(NotFoundHandlerMiddleware);
  }

  diRegister(constructor: Constructor<any>) {
    this.container.register(constructor);
    return this.container.get(constructor);
  }

  private instanceRegister() {
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
          async (req: Request, res: Response, next: NextFunction) => {
            const executeHandlerInstance = this.getMiddlewares(
              ExecuteHandlerMiddleware
            );
            const nextCallFunctionInstance = new NextCallFunction(
              req,
              res,
              next,
              ...executeHandlerInstance
            );

            const interceptFunctions = this.getInterceptors(req);
            const context = new AppContext(req, res, next);

            for (const interceptFunction of interceptFunctions) {
              if (!interceptFunction) continue;
              nextCallFunctionInstance.observable = await Promise.resolve(
                interceptFunction(context, nextCallFunctionInstance)
              );
            }

            nextCallFunctionInstance.handle().subscribe({
              next: (data) => res.send(data),
              error: (error) => next(error),
            });
          },
          (error: any, req: Request, res: Response, next: NextFunction) => {
            const instance = this.diRegister(ErrorHandlerMiddleware);
            instance.use(error, req, res, next);
          }
        );
        console.log(`Đăng ký thành công route [${router.method}] ${path} `);
      });
    });
  }

  // routes register -> middlewares -> guards -> interceptors -> handler -> interceptors

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

  private getInterceptors(req: Request) {
    return this.interceptors.flatMap((interceptor) => {
      if (
        typeof interceptor === "object" &&
        "forRoutes" in interceptor &&
        "useClass" in interceptor
      ) {
        const instance = this.diRegister(interceptor.useClass);
        return interceptor.forRoutes.map((route) => {
          const path = combinePaths(this.prefix, route);
          if (req.route.path.startsWith(path)) {
            return instance.intercept.bind(instance);
          }
          return undefined;
        });
      } else {
        const instance = this.diRegister(interceptor);
        return instance.intercept.bind(instance);
      }
    });
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

  getContainer() {
    return this.container;
  }

  useGlobalPipes() {
    if (this.pipes && this.pipes.length > 0) {
      for (const controller of this.controllers) {
        const controllerPath = getMetadata(METHOD_METADATA_KEY, controller);
        if (controllerPath === undefined) {
          continue;
        }
        const methods = Object.getOwnPropertyNames(controller.prototype).filter(
          (method) => !defaultMethods.includes(method)
        );
        methods.forEach((method) => {
          this.pipes.forEach((pipe) => {
            if (
              typeof pipe === "object" &&
              "forRoutes" in pipe &&
              "useClass" in pipe
            ) {
              const methodMetadata = getMetadata(
                METHOD_METADATA_KEY,
                controller.prototype[method]
              );
              const path = combinePaths(controllerPath, methodMetadata.path);
              pipe.forRoutes.forEach((route) => {
                if (path.startsWith(route)) {
                  controller.prototype[method].metadata = {
                    ...controller.prototype[method].metadata,
                    [USE_PIPES_METADATA_KEY]: pipe.useClass,
                  };
                }
              });
            } else {
              controller.prototype[method].metadata = {
                ...controller.prototype[method].metadata,
                [USE_PIPES_METADATA_KEY]: pipe,
              };
            }
          });
        });
      }
    }
  }
}
