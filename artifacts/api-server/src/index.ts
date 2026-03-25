import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env.PORT || "8080";
const PORT = Number(rawPort);

if (Number.isNaN(PORT) || PORT <= 0 || PORT > 65535) {
  throw new Error(`Invalid PORT value: "${rawPort}". Must be a number between 1 and 65535`);
}

app.listen(PORT, "0.0.0.0", (err?: Error) => {
  if (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
  logger.info({ port: PORT }, "Server listening");
});
