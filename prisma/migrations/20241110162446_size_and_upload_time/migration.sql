/*
  Warnings:

  - You are about to drop the column `size` on the `File` table. All the data in the column will be lost.
  - The `upload_time` column on the `File` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `sizeInBytes` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "size",
ADD COLUMN     "sizeInBytes" INTEGER NOT NULL,
DROP COLUMN "upload_time",
ADD COLUMN     "upload_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
