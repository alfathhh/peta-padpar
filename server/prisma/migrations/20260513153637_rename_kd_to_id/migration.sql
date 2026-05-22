/*
  Warnings:

  - You are about to drop the column `kddesa` on the `infrastruktur` table. All the data in the column will be lost.
  - You are about to drop the column `kdkab` on the `infrastruktur` table. All the data in the column will be lost.
  - You are about to drop the column `kdkec` on the `infrastruktur` table. All the data in the column will be lost.
  - You are about to drop the column `kdsls` on the `infrastruktur` table. All the data in the column will be lost.
  - You are about to drop the column `kddesa` on the `statistik` table. All the data in the column will be lost.
  - You are about to drop the column `kdkab` on the `statistik` table. All the data in the column will be lost.
  - You are about to drop the column `kdkec` on the `statistik` table. All the data in the column will be lost.
  - You are about to drop the column `kdsls` on the `statistik` table. All the data in the column will be lost.
  - Added the required column `iddesa` to the `infrastruktur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idkab` to the `infrastruktur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idkec` to the `infrastruktur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idkab` to the `statistik` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "infrastruktur" DROP COLUMN "kddesa",
DROP COLUMN "kdkab",
DROP COLUMN "kdkec",
DROP COLUMN "kdsls",
ADD COLUMN     "iddesa" CHAR(10) NOT NULL,
ADD COLUMN     "idkab" CHAR(4) NOT NULL,
ADD COLUMN     "idkec" CHAR(7) NOT NULL,
ADD COLUMN     "idsls" CHAR(14);

-- AlterTable
ALTER TABLE "statistik" DROP COLUMN "kddesa",
DROP COLUMN "kdkab",
DROP COLUMN "kdkec",
DROP COLUMN "kdsls",
ADD COLUMN     "iddesa" CHAR(10),
ADD COLUMN     "idkab" CHAR(4) NOT NULL,
ADD COLUMN     "idkec" CHAR(7),
ADD COLUMN     "idsls" CHAR(14);
