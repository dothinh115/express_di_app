import "reflect-metadata";
import { UserController } from "./controllers/user.controller";
import { AppManager } from "./core/app.manager";

const port = 3000;
const appManager = new AppManager({
  controllers: [UserController],
});

const app = appManager.init();

app.listen(port, () => {
  console.log("App is running at http://localhost:" + port);
});
