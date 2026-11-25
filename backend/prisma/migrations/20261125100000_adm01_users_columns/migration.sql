-- Epic EPIC-ADM-01, stories US-ADM01-001 and US-ADM01-003 (LLD v0.13, decisions L-45, L-59, L-60).

-- AlterTable: the day a user last signed in (filled by the sign-in epic; empty until then).
ALTER TABLE "users" ADD COLUMN "last_sign_in_at" TIMESTAMP(3);

-- AlterTable: which designation is the highest (a user with it may have no reporting manager).
ALTER TABLE "designations" ADD COLUMN "is_highest" BOOLEAN NOT NULL DEFAULT false;
