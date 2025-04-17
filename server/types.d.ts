declare module 'express-fileupload' {
  import { RequestHandler } from 'express';
  
  interface FileUploadOptions {
    createParentPath?: boolean;
    limits?: {
      fileSize?: number;
    };
    abortOnLimit?: boolean;
    useTempFiles?: boolean;
    tempFileDir?: string;
    safeFileNames?: boolean;
    preserveExtension?: boolean | number;
  }
  
  interface UploadedFile {
    name: string;
    data: Buffer;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
    mv(path: string, callback?: (err?: any) => void): Promise<void>;
  }
  
  interface FileArray {
    [fieldname: string]: UploadedFile[];
  }
  
  interface Files {
    [fieldname: string]: UploadedFile | UploadedFile[];
  }
  
  declare global {
    namespace Express {
      interface Request {
        files?: Files;
      }
    }
  }
  
  const fileUpload: (options?: FileUploadOptions) => RequestHandler;
  export = fileUpload;
}