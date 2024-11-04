import { setMetadata } from "../core/metadata/metadata";
import { methodMetadataKey } from "../utils/constant";
import { Method } from "../utils/types";

export const Get = (path = ""): MethodDecorator =>
  setMetadata(methodMetadataKey, { path, method: Method.GET });

export const Post = (path = ""): MethodDecorator =>
  setMetadata(methodMetadataKey, { path, method: Method.POST });

export const Patch = (path = ""): MethodDecorator =>
  setMetadata(methodMetadataKey, { path, method: Method.PATCH });

export const Delete = (path = ""): MethodDecorator =>
  setMetadata(methodMetadataKey, { path, method: Method.DELETE });
