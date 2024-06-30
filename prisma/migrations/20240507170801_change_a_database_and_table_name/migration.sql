/*
  Warnings:

  - You are about to drop the `todowebapp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "todowebapp";

-- CreateTable
CREATE TABLE "todo" (
    "id" SERIAL NOT NULL,
    "num1" DOUBLE PRECISION NOT NULL,
    "num2" DOUBLE PRECISION NOT NULL,
    "operation" TEXT NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);
