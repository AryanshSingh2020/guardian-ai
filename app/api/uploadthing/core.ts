import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuthUserId } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  childPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const userId = await getAuthUserId();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  testReport: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const userId = await getAuthUserId();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, name: file.name, type: file.type };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
