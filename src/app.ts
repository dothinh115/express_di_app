import "reflect-metadata";
import { UserController } from "./controllers/user.controller";
import { AppManager } from "./core/app.manager";
import { connectDb } from "./db/connect.db";
import { AuthGuard } from "./guards/auth.guard";
import { PostController } from "./controllers/post.controller";
import { AuthController } from "./controllers/auth.controller";
import dotenv from "dotenv";
dotenv.config();

const port = 3000;
const appManager = new AppManager({
  controllers: [UserController, PostController, AuthController],
  prefix: ["api"],
  guards: [AuthGuard],
});

(async () => {
  await connectDb();
  const app = appManager.init();

  app.listen(port, () => {
    console.log("App is running at http://localhost:" + port);
  });
})();
