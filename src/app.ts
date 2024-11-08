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
import { StaticMiddleware } from "./middlewares/static.middleware";
import { StaticController } from "./controllers/static.controller";
dotenv.config();

const port = 3000;
const appManager = new AppManager({
  controllers: [
    UserController,
    PostController,
    AuthController,
    UploadController,
    StaticController,
  ],
  prefix: ["api"],
  guards: [AuthGuard],
  middlewares: [
    {
      forRoutes: ["/upload"],
      useClass: SingleFileUploadMiddleware,
    },
    {
      forRoutes: ["/static"],
      useClass: StaticMiddleware,
    },
  ],
});

(async () => {
  await connectDb();
  const app = appManager.init();

  app.listen(port, () => {
    console.log("App is running at http://localhost:" + port);
  });
})();
