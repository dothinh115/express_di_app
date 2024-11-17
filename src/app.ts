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

(async () => {
  await connectDb();

  app.use("/static", express.static(path.resolve("./uploads")));

  app.init();

  app.listen(3000, () => {
    console.log("App is running at http://localhost:" + 3000);
  });
})();
