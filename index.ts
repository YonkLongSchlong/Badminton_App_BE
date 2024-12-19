import app from "./app";

const corsMiddleware = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Replace with your frontend's URL
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const origin = req.headers.get("Origin");
  const allowedOrigin = "*";
  const response = await app.fetch(req);

  if (origin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  } else {
    // Optionally, handle other scenarios like rejecting with a CORS error or applying a fallback policy
    response.headers.set("Access-Control-Allow-Origin", "*"); // Fallback to wildcard (or handle as necessary)
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
};

Bun.serve({
  port: Number.parseInt(Bun.env.PORT as string) || 3000,
  hostname: "0.0.0.0",
  fetch: corsMiddleware,
});
