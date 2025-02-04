import type { Config } from "@react-router/dev/config";
import {getDocs} from "@docsmith/runtime";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // prerender() {
  //   const docs = getDocs();
  //
  //   // Start with base routes
  //   const routes = [
  //     "/",                // Home page
  //     "/docs",           // Docs index
  //   ];
  //
  //   // Add a route for each doc
  //   docs.forEach(doc => {
  //     routes.push(`/docs/${doc.slug}`);
  //   });
  //
  //   return routes;
  // }
} satisfies Config;
