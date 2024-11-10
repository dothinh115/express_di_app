import "reflect-metadata";
import { UserController } from "./controllers/user.controller";
import { AppManager } from "./core/app.manager";
import { connectDb } from "./db/connect.db";
import { AuthGuard } from "./guards/auth.guard";
import { PostController } from "./controllers/post.controller";
import { AuthController } from "./controllers/auth.controller";
import dotenv from "dotenv";
import { UploadController } from "./controllers/upload.controller";
import { SingleFileUploadMiddleware } from "./middlewares/single-file-upload.middleware";
import express from "express";
import path from "path";
dotenv.config();

const port = 3000;
const appManager = new AppManager({
  controllers: [
    UserController,
    PostController,
    AuthController,
    UploadController,
  ],
  prefix: ["api"],
  guards: [AuthGuard],
  middlewares: [
    {
      forRoutes: ["/upload"],
      useClass: SingleFileUploadMiddleware,
    },
  ],
});

(async () => {
  await connectDb();
  const app = appManager.init();

  app.use("/static", express.static(path.resolve("./uploads")));

  app.listen(port, () => {
    console.log("App is running at http://localhost:" + port);
  });
})();
