import { AppGateway } from "../core/base/gateway.base";
import { SocketGateway } from "../core/decorators/gateway.decorator";
import { SubscribeMessage } from "../core/decorators/method.decorator";
import { Socket } from "socket.io";
import { Inject } from "../core/decorators/param.decorator";
import { User } from "../db/models/user.model";

@SocketGateway({
  namespace: "/chat",
  port: 3001,
})
export class ChatController implements AppGateway {
  constructor(@Inject(User) private userModel: typeof User) {}
  handleHandshake(socket: Socket): boolean | Promise<boolean> {
    return true;
  }

  @SubscribeMessage("message")
  async handleMessage(socket: Socket, message: string) {
    console.log(message);
    const users = await this.userModel.find().lean();
    socket.emit("reply", users);
  }
}
