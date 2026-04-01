import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";

const PORT = parseInt(process.env.PORT || "5000", 10);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in environment. Copy .env.example to .env and set your URI.");
  process.exit(1);
}

if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error(
    "JWT_SECRET must be set and at least 16 characters long (use a long random string in production)."
  );
  process.exit(1);
}

async function main() {
  await connectDb(MONGODB_URI);
  const app = createApp({
    jwtSecret: JWT_SECRET,
    clientOrigin: CLIENT_ORIGIN,
  });
  app.listen(PORT, () => {
    console.log(`Finance API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
