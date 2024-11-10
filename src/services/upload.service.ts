import multer, { Multer } from "multer";
import { Injectable } from "../core/decorators/injectable.decorator";
import { Request } from "../core/utils/types";
import path from "path";

type TUploader = {
  destination?: string;
  filename?: (req: Request, file: Express.Multer.File, cb: any) => void;
};

@Injectable()
export class Uploader {
  upload: Multer;
  constructor(options: TUploader = {}) {
    const storage = multer.diskStorage({
      destination: options.destination ?? path.resolve("./uploads"),
      filename: (req: Request, file: Express.Multer.File, cb: any) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });
    this.upload = multer({ storage });
  }

  single(fieldName: string) {
    return this.upload.single(fieldName);
  }

  array(fieldName: string, maxCount: number) {
    return this.upload.array(fieldName, maxCount);
  }

  fields(array: multer.Field[]) {
    return this.upload.fields(array);
  }
}
