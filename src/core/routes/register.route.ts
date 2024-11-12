import express from "express";
import { getMetadata } from "../metadata/metadata";
import { combinePaths, defaultMethods } from "../utils/common";
import { RouteRegisterMiddleware } from "../middlewares/route-register.middleware";
import { METHOD_METADATA_KEY } from "../utils/constant";

export const routeRegister = (instance: any) => {
  const controllerPath = getMetadata(METHOD_METADATA_KEY, instance.constructor);
  const methods = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance)
  ).filter((method) => !defaultMethods.includes(method));
  return methods
    .sort((a, b) => {
      const pathA = getMetadata(METHOD_METADATA_KEY, instance[a]).path;
      const pathB = getMetadata(METHOD_METADATA_KEY, instance[b]).path;
      return pathA.includes(":") ? -1 : pathB.includes(":") ? -1 : 0;
    })
    .map((method) => {
      const methodMetadata = getMetadata(METHOD_METADATA_KEY, instance[method]);
      const path = combinePaths(controllerPath, methodMetadata.path);
      const routeRegisterMiddleware = new RouteRegisterMiddleware(
        instance,
        method
      );
      return {
        path,
        method: methodMetadata.method,
        middleware: routeRegisterMiddleware.use.bind(routeRegisterMiddleware),
      };
    });
};
