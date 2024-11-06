import { Controller } from "../core/decorators/controller.decorator";
import { Get, Post } from "../core/decorators/method.decorator";
import { Body } from "../core/decorators/param.decorator";
import { Protected } from "../decorators/protected.decorator";
import { UserService } from "../services/user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Get("get") // /user/get
  find() {
    return this.userService.find();
  }

  @Get(":id") // /user/:id
  findById() {
    return "id";
  }
}
