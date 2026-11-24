-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('SSO', 'LOCAL');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('STANDARD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('ACTIVE', 'DRAFT', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DataScope" AS ENUM ('OWN', 'DEPARTMENT', 'COMPANY');

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "employee_code" VARCHAR(5) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "mobile" VARCHAR(20),
    "department_id" UUID,
    "designation_id" UUID,
    "reporting_manager_id" UUID,
    "auth_type" "AuthType" NOT NULL DEFAULT 'SSO',
    "password_hash" VARCHAR(255),
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "first_sign_in_at" TIMESTAMP(3),
    "deactivated_at" TIMESTAMP(3),
    "deactivation_reason" VARCHAR(20),
    "deactivation_note" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_time_passwords" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "one_time_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "type" "RoleType" NOT NULL DEFAULT 'CUSTOM',
    "status" "RoleStatus" NOT NULL DEFAULT 'DRAFT',
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "landing_order" SMALLINT NOT NULL DEFAULT 99,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "area" VARCHAR(40) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "scope" "DataScope",

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_company_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "company_code" VARCHAR(10) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "assigned_by" VARCHAR(5) NOT NULL,
    "assigned_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_company_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_matrix_versions" (
    "id" UUID NOT NULL,
    "saved_by" VARCHAR(5) NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(500),

    CONSTRAINT "permission_matrix_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "actor" VARCHAR(5) NOT NULL,
    "company_code" VARCHAR(10),
    "kind" VARCHAR(10) NOT NULL,
    "entity" VARCHAR(40),
    "entity_key" VARCHAR(64),
    "before" JSONB,
    "after" JSONB,
    "reason" VARCHAR(500),
    "permission_key" VARCHAR(60),
    "code" VARCHAR(40),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "designations_code_key" ON "designations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "one_time_passwords_user_id_issued_at_idx" ON "one_time_passwords"("user_id", "issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "user_company_roles_user_id_company_code_idx" ON "user_company_roles"("user_id", "company_code");

-- CreateIndex
CREATE INDEX "audit_log_entity_entity_key_idx" ON "audit_log"("entity", "entity_key");

-- CreateIndex
CREATE INDEX "audit_log_actor_created_at_idx" ON "audit_log"("actor", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_time_passwords" ADD CONSTRAINT "one_time_passwords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company_roles" ADD CONSTRAINT "user_company_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company_roles" ADD CONSTRAINT "user_company_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_company_roles" ADD CONSTRAINT "user_company_roles_company_code_fkey" FOREIGN KEY ("company_code") REFERENCES "companies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
