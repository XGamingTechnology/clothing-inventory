import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "db",
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "clothing_inventory",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: true, // ✅ WAJIB true untuk initial setup
  logging: ["schema", "query", "error"], // ✅ Tampilkan CREATE TABLE queries
};
