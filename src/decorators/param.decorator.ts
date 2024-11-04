import { Response } from "express";
import { setMetadata } from "../core/metadata/metadata";
import { paramMetadataKey } from "../utils/constant";
import { Request } from "../utils/types";

export const Body = (): ParameterDecorator =>
  setMetadata(paramMetadataKey, (req: Request) => req.body);

export const Req = (): ParameterDecorator =>
  setMetadata(paramMetadataKey, (req: Request) => req);

export const Res = (): ParameterDecorator =>
  setMetadata(paramMetadataKey, (req: Request, res: Response) => res);

export const Inject = (value: any): ParameterDecorator =>
  setMetadata(paramMetadataKey, value);
