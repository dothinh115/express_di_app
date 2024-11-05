import { Controller } from "../decorators/controller.decorator";
import { Get, Post } from "../decorators/method.decorator";
import { Body } from "../decorators/param.decorator";
import { UserService } from "../services/user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Get()
  find() {
    return this.userService.find();
  }

  @Get("get/:id")
  find1() {
    return this.userService.find();
  }

  @Get(":id") // /user/:id
  findById() {}
}
