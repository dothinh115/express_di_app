import { Socket } from "socket.io";

export class AppGateway {
  handleHandshake(socket: Socket): boolean | Promise<boolean> {
    return false;
  }
}
