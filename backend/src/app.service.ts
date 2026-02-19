import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "Clothing Inventory API",
      environment: process.env.NODE_ENV || "development",
    };
  }
}
