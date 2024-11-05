import express, { Router } from "express";
import { getMetadata } from "../metadata/metadata";
import { combinePaths } from "../utils/common";
import { RouteRegisterMiddleware } from "../middlewares/route-register.middleware";
import { methodMetadataKey } from "../utils/constant";

export const routeRegister = (instance: any): Router => {
  const router = express.Router();
  const controllerPath = getMetadata(methodMetadataKey, instance.constructor);
  const methods = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance)
  ).filter((method) => method !== "constructor");
  methods
    .sort((a: string, b: string) => {
      const pathA = getMetadata(methodMetadataKey, instance[a]).path;
      const pathB = getMetadata(methodMetadataKey, instance[b]).path;
      return pathA.includes(":") ? -1 : pathB.includes(":") ? -1 : 0;
    })
    .forEach((method) => {
      const methodMetadata = getMetadata(methodMetadataKey, instance[method]);
      const path = combinePaths(controllerPath, methodMetadata.path);
      const routeRegisterMiddleware = new RouteRegisterMiddleware(
        instance,
        method
      );
      (router as any)[methodMetadata.method.toLowerCase()](
        path,
        routeRegisterMiddleware.use.bind(routeRegisterMiddleware)
      );
    });
  return router;
};
