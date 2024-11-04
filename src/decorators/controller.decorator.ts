import { setMetadata } from "../core/metadata/metadata";
import { methodMetadataKey } from "../utils/constant";

export const Controller = (path = ""): ClassDecorator =>
  setMetadata(methodMetadataKey, path);
