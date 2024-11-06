import { Response } from "express";
import { paramMetadataKey } from "../utils/constant";
import { Request } from "../utils/types";
import { setMetadata } from "../metadata/metadata";

export const Body = (): ParameterDecorator =>
  setMetadata(paramMetadataKey, (req: Request) => req.body);

export const Req = (): ParameterDecorator =>
  setMetadata(paramMetadataKey, (req: Request) => req);

export const Res = (): ParameterDecorator =>
  setMetadata(paramMetadataKey, (req: Request, res: Response) => res);

export const Inject = (value: any): ParameterDecorator =>
  setMetadata(paramMetadataKey, value);
