import figlet from "figlet";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve CSS file
    if (url.pathname === "/styles.css") {
      const file = Bun.file("./dist/styles.css");
      if (await file.exists()) {
        return new Response(file, {
          headers: {
            "Content-Type": "text/css",
          },
        });
      }
      return new Response(
        "CSS file not found. Run 'bun run build:css' first.",
        {
          status: 404,
        }
      );
    }

    // Handle HTML route
    if (url.pathname === "/") {
      const htmlFile = Bun.file("./index.html");
      const html = await htmlFile.text();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Handle figlet route
    if (url.pathname === "/figlet") {
      const body = figlet.textSync("Bun!");
      return new Response(body);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
