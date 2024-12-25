-- DropIndex
DROP INDEX "Media_url_key";

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Blob" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT,
    "uploadPath" TEXT NOT NULL,

    CONSTRAINT "Blob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blob_fileName_key" ON "Blob"("fileName");
