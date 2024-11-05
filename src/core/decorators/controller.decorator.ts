import { setMetadata } from "../metadata/metadata";
import { methodMetadataKey } from "../utils/constant";

export const Controller = (path = ""): ClassDecorator =>
  setMetadata(methodMetadataKey, path);
