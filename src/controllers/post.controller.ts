import { Controller } from "../core/decorators/controller.decorator";
import { Get } from "../core/decorators/method.decorator";

@Controller("post")
export class PostController {
  @Get()
  find() {
    return "get posts";
  }
}
