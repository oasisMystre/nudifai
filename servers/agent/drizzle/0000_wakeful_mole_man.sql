CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"threadId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "threads_id_unique" UNIQUE("id"),
	CONSTRAINT "threads_threadId_unique" UNIQUE("threadId")
);
