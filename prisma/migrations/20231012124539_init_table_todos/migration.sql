-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);
