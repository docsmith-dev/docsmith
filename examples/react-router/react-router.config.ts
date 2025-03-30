import type { Config } from "@react-router/dev/config";
import { getDocs } from "@docsmith/runtime";

export default {
  ssr: true,
  prerender() {
    const docs = getDocs();

    const routes = [
      "/",                // Home page
      "/docs",           // Docs index
    ];

    // Add a route for each doc
    docs.forEach(doc => {
      routes.push(`/docs/${doc.slug}`);
    });

    return routes;
  }
} satisfies Config;
