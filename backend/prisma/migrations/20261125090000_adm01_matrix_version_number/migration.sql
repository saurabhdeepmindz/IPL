-- Epic EPIC-ADM-01, story US-ADM01-014 (LLD v0.9, decision L-19): the matrixVersion is a whole number that grows by one on each save.

-- AlterTable: add the column, number the rows already there by save time, then make it required and unique.
ALTER TABLE "permission_matrix_versions" ADD COLUMN "version" INTEGER;

UPDATE "permission_matrix_versions" AS v
SET "version" = n.rn
FROM (SELECT "id", ROW_NUMBER() OVER (ORDER BY "saved_at", "id") AS rn FROM "permission_matrix_versions") AS n
WHERE v."id" = n."id";

ALTER TABLE "permission_matrix_versions" ALTER COLUMN "version" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permission_matrix_versions_version_key" ON "permission_matrix_versions"("version");
