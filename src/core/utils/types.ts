import { Request as ERequest } from "express";

export enum Method {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export type Request = ERequest & {
  context: {
    instance: any;
    handlerName: string;
    params: any;
  };
};
