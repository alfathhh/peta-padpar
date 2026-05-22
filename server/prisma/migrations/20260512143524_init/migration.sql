-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_infra" (
    "id" SERIAL NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(10) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategori_infra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastruktur" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "kategori" VARCHAR(50) NOT NULL,
    "alamat" TEXT,
    "fotoUrl" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "kdkab" CHAR(4) NOT NULL,
    "kdkec" CHAR(6) NOT NULL,
    "kddesa" CHAR(10) NOT NULL,
    "kdsls" CHAR(12),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infrastruktur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistik" (
    "id" SERIAL NOT NULL,
    "kdkab" CHAR(4) NOT NULL,
    "kdkec" CHAR(6),
    "kddesa" CHAR(10),
    "kdsls" CHAR(12),
    "indikator" VARCHAR(255) NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "satuan" VARCHAR(50),
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_infra_value_key" ON "kategori_infra"("value");

-- AddForeignKey
ALTER TABLE "infrastruktur" ADD CONSTRAINT "infrastruktur_kategori_fkey" FOREIGN KEY ("kategori") REFERENCES "kategori_infra"("value") ON DELETE RESTRICT ON UPDATE CASCADE;
