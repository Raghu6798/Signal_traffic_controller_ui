"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "./auth";
import { headers } from "next/headers";
import { createSignalDocument } from "./actions";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Handles the secure upload of a PDF to S3 and records it in the database.
 */
export async function uploadAndRecordDocument(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const intersection = formData.get("intersection") as string;

  if (!file || !projectId) throw new Error("Missing required fields");

  // 1. Generate a unique ID for the document (matches session_id logic in Python)
  const sessionId = nanoid();
  const s3Key = `${sessionId}.pdf`;

  // 2. Upload to S3
  const buffer = Buffer.from(await file.arrayBuffer());
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: "application/pdf",
    })
  );

  const s3UrlPdf = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  // 3. Create the document record in Prisma
  const doc = await createSignalDocument({
    projectId,
    intersection: intersection || file.name.split(".")[0],
    fileName: file.name,
    s3UrlPdf,
  });

  // 4. Update the record with the sessionId (for easy lookup by Python backend)
  // Note: We can add an 'internalId' or similar to our schema if needed,
  // but for now, the Python backend can look up via the S3 URL.

  return { success: true, documentId: doc.id, sessionId };
}
