-- CreateTable
CREATE TABLE "todowebapp" (
    "id" SERIAL NOT NULL,
    "num1" DOUBLE PRECISION NOT NULL,
    "num2" DOUBLE PRECISION NOT NULL,
    "operation" TEXT NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "todowebapp_pkey" PRIMARY KEY ("id")
);
