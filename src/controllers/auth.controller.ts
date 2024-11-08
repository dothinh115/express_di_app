import { Controller } from "../core/decorators/controller.decorator";
import { Post } from "../core/decorators/method.decorator";
import { Body } from "../core/decorators/param.decorator";
import { AuthService } from "../services/auth.service";
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  login(@Body() body: any) {
    return this.authService.login(body);
  }
}
