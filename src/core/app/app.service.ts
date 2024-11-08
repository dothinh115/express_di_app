import { Injectable } from "../decorators/injectable.decorator";
import express from "express";

@Injectable()
export class AppService {
  express = express();
  getInstance() {
    return this.express;
  }
}
