/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `SharedFolder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_uuid_key" ON "SharedFolder"("uuid");
