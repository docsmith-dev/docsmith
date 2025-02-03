import {
  type RouteConfig,
  index,
  route,
  prefix,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("docs", [
    layout("routes/docs/layout.tsx", [
      index("routes/docs/home.tsx"),
      route(":slug", "routes/docs/slug.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
