import { setMetadata } from "../metadata/metadata";
import { SOCKET_GATEWAY_METADATA_KEY } from "../utils/constant";
import { TGateway } from "../utils/types";

export const SocketGateway = (options: TGateway = {}): ClassDecorator =>
  setMetadata(SOCKET_GATEWAY_METADATA_KEY, options);
