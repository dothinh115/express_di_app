import { setMetadata } from "../metadata/metadata";
import { METHOD_METADATA_KEY } from "../utils/constant";

export const Controller = (path = ""): ClassDecorator =>
  setMetadata(METHOD_METADATA_KEY, path);
