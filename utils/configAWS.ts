import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: Bun.env.AWS_REGION as string,
  credentials: {
    accessKeyId: Bun.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

