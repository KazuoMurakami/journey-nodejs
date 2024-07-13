/*
  Warnings:

  - You are about to drop the column `tripId` on the `participant` table. All the data in the column will be lost.
  - Added the required column `trip_id` to the `participant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "trip_id" TEXT NOT NULL,
    CONSTRAINT "participant_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_participant" ("email", "id", "is_confirmed", "is_owner", "name") SELECT "email", "id", "is_confirmed", "is_owner", "name" FROM "participant";
DROP TABLE "participant";
ALTER TABLE "new_participant" RENAME TO "participant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
