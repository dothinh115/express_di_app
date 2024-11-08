import { Injectable } from "../core/decorators/injectable.decorator";
import { Request } from "../core/utils/types";
import multer, { Field, Multer } from "multer";

type DefaultOptions = {
  destination?: string;
  filename?: (req: Request, file: Express.Multer.File, cb: any) => void;
};

@Injectable()
export class Uploader {
  private upload: Multer;
  constructor(options: DefaultOptions = {}) {
    const storage = multer.diskStorage({
      destination: options.destination ?? "./uploads",
      filename:
        options.filename ??
        ((req: Request, file: Express.Multer.File, cb: any) => {
          cb(null, Date.now() + "-" + file.originalname);
        }),
    });
    this.upload = multer({ storage });
  }

  single(fieldName: string) {
    return this.upload.single(fieldName);
  }

  array(fieldName: string, maxCount: number) {
    return this.upload.array(fieldName, maxCount);
  }

  fields(fieldsArray: Field[]) {
    return this.upload.fields(fieldsArray);
  }
}
