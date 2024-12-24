import PromiseFtp from "promise-ftp";

type CustomerFtpDirectoryConnectDTO = {
  host: string;
  password: string;
  user: string;
};

export class CustomerFtpDirectory {
  private ftpClient: PromiseFtp;

  private constructor(ftpClient: PromiseFtp) {
    this.ftpClient = ftpClient;
  }

  public static async connect(
    input: CustomerFtpDirectoryConnectDTO
  ): Promise<CustomerFtpDirectory> {
    const { host, password, user } = input;
    const ftpClient = new PromiseFtp();
    await ftpClient.connect({ host, password, user });
    return new CustomerFtpDirectory(ftpClient);
  }

  /*
     It moves all files from a src dir to a dest dir returning all files moved 
  */
  public async processDirectory(
    srcDirPath: string,
    destDirPath: string
  ): Promise<Buffer[]> {
    await this.assertConnection();
    const filesName = await this.listFilesPaths(srcDirPath);
    const filesPath = filesName.map((fileName) => srcDirPath + "/" + fileName);
    const files = await Promise.all(filesPath.map(this.cutFile.bind(this)));
    for (let i = 0; i < files.length; i++) {
      await this.ftpClient.put(files[i], destDirPath + "/" + filesName[i]);
    }
    return files;
  }

  public async closeConnection(): Promise<void> {
    await this.ftpClient.end();
  }

  private async listFilesPaths(directoryPath: string): Promise<string[]> {
    const ftpList = await this.ftpClient.list(directoryPath);
    return ftpList.map((file) => {
      if (typeof file === "string") return file;
      return file.name;
    });
  }

  private async cutFile(filePath: string): Promise<Buffer> {
    const fileStream = await this.ftpClient.get(filePath);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = new Array();
      fileStream
        .resume()
        .on("data", (chunk) => {
          chunks.push(chunk);
        })
        .on("close", async () => {
          await this.ftpClient.delete(filePath);
          resolve(Buffer.concat(chunks));
        })
        .on("error", (err) => reject(err));
    });
  }

  private async assertConnection(): Promise<void> {
    try {
      await this.ftpClient.status();
    } catch (_error: unknown) {
      throw new Error(
        "Can't handle this operation because connection is closed"
      );
    }
  }
}
