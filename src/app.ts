import "reflect-metadata";
import { UserController } from "./controllers/user.controller";
import { AppManager } from "./core/app.manager";
import { connectDb } from "./db/connect.db";
import { AuthGuard } from "./guards/auth.guard";
import { PostController } from "./controllers/post.controller";
import { AuthController } from "./controllers/auth.controller";
import { ChatController } from "./controllers/chat.controller";
import { UploadController } from "./controllers/upload.controller";
import { SingleFileUploadMiddleware } from "./middlewares/single-file-upload.middleware";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { BaseResponseFormatter } from "./interceptors/response-formatter.interceptor";
import { ValidationPipe } from "./pipes/validation.pipe";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./graph/resolvers/user.resolver";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { PostResolver } from "./graph/resolvers/post.resolver";
import { AuthGraphMiddleware } from "./graph/middlewares/auth.middleware";
dotenv.config();

const app = new AppManager({
  controllers: [
    UserController,
    PostController,
    AuthController,
    UploadController,
    ChatController,
  ],
  prefix: ["api"],
  guards: [AuthGuard],
  middlewares: [
    {
      forRoutes: ["/upload"],
      useClass: SingleFileUploadMiddleware,
    },
  ],
  interceptors: [
    {
      forRoutes: ["/user", "/post"],
      useClass: BaseResponseFormatter,
    },
  ],
  pipes: [
    {
      forRoutes: ["/user"],
      useClass: ValidationPipe,
    },
  ],
});

async function bootstrap() {
  await connectDb();

  app.use("/static", express.static(path.resolve("./uploads")));

  const container = app.getContainer();
  const resolvers = [UserResolver, PostResolver];
  const middlewares = [AuthGraphMiddleware];

  for (const resolver of resolvers) {
    app.diRegister(resolver);
  }

  for (const middleware of middlewares) {
    app.diRegister(middleware);
  }

  const schema = await buildSchema({
    resolvers: resolvers as any,
    globalMiddlewares: middlewares,
    container,
  });

  const server = new ApolloServer({
    schema,
    introspection: true,
  });

  await server.start();
  app.use("/", express.json());
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  app.init();

  app.listen(3000, () => {
    console.log("App is running at http://localhost:" + 3000);
  });
}

bootstrap();
