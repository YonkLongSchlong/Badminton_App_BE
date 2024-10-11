import app from "./app";
import { redisClient } from "./src/db";

// Define a CORS middleware
const corsMiddleware = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", 
      },
    });
  }


  const response = await app.fetch(req);

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
};

Bun.serve({
  port: 3000,
  hostname: "localhost",
  fetch: corsMiddleware, 
});
