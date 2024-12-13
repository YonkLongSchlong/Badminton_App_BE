ALTER TABLE "users_courses" ALTER COLUMN "paid_course_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users_courses" ADD COLUMN "status" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users_courses" ADD COLUMN "free_course_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_courses" ADD CONSTRAINT "users_courses_free_course_id_free_course_id_fk" FOREIGN KEY ("free_course_id") REFERENCES "public"."free_course"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "started_course";