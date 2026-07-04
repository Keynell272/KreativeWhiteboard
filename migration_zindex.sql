CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "Boards" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text,
    "OwnerId" uuid NOT NULL,
    "ParentCardId" uuid,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Boards" PRIMARY KEY ("Id")
);

CREATE TABLE "Cards" (
    "Id" uuid NOT NULL,
    "BoardId" uuid NOT NULL,
    "Type" integer NOT NULL,
    "Title" text NOT NULL,
    "X" double precision NOT NULL,
    "Y" double precision NOT NULL,
    "Width" integer NOT NULL,
    "Height" integer NOT NULL,
    "Color" text,
    "Content" text,
    "LinkedBoardId" uuid,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Cards" PRIMARY KEY ("Id")
);

CREATE TABLE "Connections" (
    "Id" uuid NOT NULL,
    "BoardId" uuid NOT NULL,
    "SourceCardId" uuid NOT NULL,
    "TargetCardId" uuid NOT NULL,
    "Label" text,
    "Color" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Connections" PRIMARY KEY ("Id")
);

CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Email" text NOT NULL,
    "DisplayName" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260617004122_InitialCreate', '10.0.9');

COMMIT;

START TRANSACTION;
ALTER TABLE "Cards" ADD "ZIndex" integer NOT NULL DEFAULT 0;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260704164936_AddZIndexToCard', '10.0.9');

COMMIT;

