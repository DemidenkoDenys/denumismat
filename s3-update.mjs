import { S3Client, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { configDotenv } from "dotenv";
import fs from "fs/promises";

configDotenv();

const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const allObjects = [];

const paginator = paginateListObjectsV2(
  { client: s3 },
  { Bucket: "denumismat", Prefix: "coins/" }
);

for await (const page of paginator) {
  allObjects.push(...(page.Contents || []));
}

const transform = (data) => {
  return data.reduce((acc, item) => {
    const parts = item.Key.split('/');
    const fileName = parts.pop();
    const folderName = parts.pop();

    if (folderName) {
      if (!acc[folderName]) acc[folderName] = [];
      acc[folderName].push(fileName);
    }
    return acc;
  }, {});
};

fs.writeFile("s3-structure.json", JSON.stringify(transform(allObjects)), null, 2);

