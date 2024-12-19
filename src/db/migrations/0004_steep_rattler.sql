ALTER TABLE "question" DROP CONSTRAINT "question_free_lesson_id_free_lesson_id_fk";
--> statement-breakpoint
ALTER TABLE "question" DROP CONSTRAINT "question_paid_lesson_id_paid_lesson_id_fk";
--> statement-breakpoint
ALTER TABLE "paid_course" ALTER COLUMN "status" SET DEFAULT 'non-publish';--> statement-breakpoint
ALTER TABLE "users_lessons" ADD COLUMN "paid_course_id" integer;--> statement-breakpoint
ALTER TABLE "users_lessons" ADD COLUMN "free_course_id" integer;--> statement-breakpoint
ALTER TABLE "users_lessons" ADD COLUMN "course_type" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question" ADD CONSTRAINT "question_free_lesson_id_free_lesson_id_fk" FOREIGN KEY ("free_lesson_id") REFERENCES "public"."free_lesson"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question" ADD CONSTRAINT "question_paid_lesson_id_paid_lesson_id_fk" FOREIGN KEY ("paid_lesson_id") REFERENCES "public"."paid_lesson"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_lessons" ADD CONSTRAINT "users_lessons_paid_course_id_paid_course_id_fk" FOREIGN KEY ("paid_course_id") REFERENCES "public"."paid_course"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_lessons" ADD CONSTRAINT "users_lessons_free_course_id_free_course_id_fk" FOREIGN KEY ("free_course_id") REFERENCES "public"."free_course"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
