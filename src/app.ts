import "reflect-metadata";
import { UserController } from "./controllers/user.controller";
import { AppManager } from "./core/app.manager";
import { connectDb } from "./db/connect.db";
import { UserMiddleware } from "./middlewares/user.middleware";
import { AuthGuard } from "./guards/auth.guard";

const port = 3000;
const appManager = new AppManager({
  controllers: [UserController],
  prefix: ["api"],
  middlewares: [
    {
      provide: "/user/get",
      useClass: UserMiddleware,
    },
  ],
  guards: [
    {
      provide: "/user/get",
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
