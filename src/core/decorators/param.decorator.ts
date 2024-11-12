import { Response } from "express";
import { PARAM_METADATA_KEY } from "../utils/constant";
import { Request } from "../utils/types";
import { setMetadata } from "../metadata/metadata";

export const Body = (): ParameterDecorator =>
  setMetadata(PARAM_METADATA_KEY, (req: Request) => req.body);

export const Req = (): ParameterDecorator =>
  setMetadata(PARAM_METADATA_KEY, (req: Request) => req);

export const Res = (): ParameterDecorator =>
  setMetadata(PARAM_METADATA_KEY, (req: Request, res: Response) => res);

export const Inject = (value: any): ParameterDecorator =>
  setMetadata(PARAM_METADATA_KEY, value);

export const Param = (field: string): ParameterDecorator =>
  setMetadata(
    PARAM_METADATA_KEY,
    (req: Request) => req.params[field] ?? undefined
  );
