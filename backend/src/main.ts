import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { Connection } from "typeorm"; // ✅ Import dari "typeorm" (bukan @nestjs/typeorm)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ FIX 1: CORS configuration yang benar (HILANGKAN extra space di origin!)
  app.enableCors({
    origin: "https://inventory.getopurtunity.online", // ✅ TANPA extra space di akhir!
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT || 3002;

  // ✅ FIX 2: Dapatkan connection dengan cara yang benar
  const connection = app.get(Connection); // ✅ Cara benar untuk TypeORM v0.3+
  await connection.synchronize(); // Force schema sync saat start

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`✅ Database schema synchronized successfully`);
  console.log(`📊 Tables created: ${Object.keys(connection.entityMetadatas).join(", ")}`);
}
bootstrap();
