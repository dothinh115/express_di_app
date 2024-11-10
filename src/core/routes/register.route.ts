import express from "express";
import { getMetadata } from "../metadata/metadata";
import { combinePaths, defaultMethods } from "../utils/common";
import { RouteRegisterMiddleware } from "../middlewares/route-register.middleware";
import { methodMetadataKey } from "../utils/constant";

export const routeRegister = (instance: any) => {
  const controllerPath = getMetadata(methodMetadataKey, instance.constructor);
  const methods = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance)
  ).filter((method) => !defaultMethods.includes(method));
  return methods
    .sort((a, b) => {
      const pathA = getMetadata(methodMetadataKey, instance[a]).path;
      const pathB = getMetadata(methodMetadataKey, instance[b]).path;
      return pathA.includes(":") ? -1 : pathB.includes(":") ? -1 : 0;
    })
    .map((method) => {
      const methodMetadata = getMetadata(methodMetadataKey, instance[method]);
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
