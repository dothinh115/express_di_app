import { setMetadata } from "../metadata/metadata";
import {
  METHOD_METADATA_KEY,
  SUBSCRIBE_MESSAGE_METADATA_KEY,
} from "../utils/constant";
import { Method } from "../utils/types";

export const Get = (path = ""): MethodDecorator =>
  setMetadata(METHOD_METADATA_KEY, { path, method: Method.GET });

export const Post = (path = ""): MethodDecorator =>
  setMetadata(METHOD_METADATA_KEY, { path, method: Method.POST });

export const Patch = (path = ""): MethodDecorator =>
  setMetadata(METHOD_METADATA_KEY, { path, method: Method.PATCH });

export const Delete = (path = ""): MethodDecorator =>
  setMetadata(METHOD_METADATA_KEY, { path, method: Method.DELETE });

export const SubscribeMessage = (message: string): MethodDecorator =>
  setMetadata(SUBSCRIBE_MESSAGE_METADATA_KEY, message);
