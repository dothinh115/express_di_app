import "reflect-metadata";
import { UserController } from "./controllers/user.controller";
import { AppManager } from "./core/app.manager";
import { connectDb } from "./db/connect.db";
import { TestMiddleware } from "./middlewares/test.middleware";
import { AuthGuard } from "./guards/auth.guard";
import { PostController } from "./controllers/post.controller";

const port = 3000;
const appManager = new AppManager({
  controllers: [UserController, PostController],
  prefix: ["api"],
  guards: [
    {
      forRoute: "/user",
      useClass: AuthGuard,
    },
    {
      forRoute: "/post",
      useClass: AuthGuard,
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
