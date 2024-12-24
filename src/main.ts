import { CustomerFtpDirectory } from "./CustomerFtpDirectory";

const FTP_SRC_PATH = "/input";
const FTP_OUTPUT_PATH = "/output";
const FTP_USER = "marcos";
const FTP_HOST = "localhost";
const FTP_PASSWORD = "123456";

async function main() {
  const customerFtpDirectory = await CustomerFtpDirectory.connect({
    host: FTP_HOST,
    user: FTP_USER,
    password: FTP_PASSWORD,
  });
  const files = await customerFtpDirectory.processDirectory(
    FTP_SRC_PATH,
    FTP_OUTPUT_PATH
  );
  // It should be Sent to s3
  files.forEach((file) => {
    console.log(file.toString());
  });
  await customerFtpDirectory.closeConnection();
}

main();
