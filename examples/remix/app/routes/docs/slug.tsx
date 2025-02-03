// app/routes/docs.$.tsx
// import { getDocs } from "@docsmith/runtime";

// export async function loader({ params }: Route.LoaderArgs) {
//   // params.slug is typed correctly
//   return {
//     // doc: getDoc(params.slug),
//     // navigation: getNavigation(params.slug)
//   };
// }

import {Route} from "../../../.react-router/types/app/routes/docs/+types/slug";

export default function DocsPage({ params, loaderData }: Route.ComponentProps) {
  // const { doc, navigation } = loaderData

  return (
    <div>
      {/*<OnThisPage*/}
      {/*  doc={doc}*/}
      {/*  activeId={activeHeading}*/}
      {/*  onHeadingIntersect={setActiveHeading}*/}
      {/*>*/}
      {/*  {({ headings, activeId }) => (*/}
      {/*    // Render headings...*/}
      {/*  )}*/}
      {/*</OnThisPage>*/}

      {/*<h1>{doc.frontmatter.title}</h1>*/}
      {/*<nav>*/}
      {/*  /!* Navigation is fully typed *!/*/}
      {/*  {navigation.segments.map(segment => (*/}
      {/*    <span key={segment}>{segment}</span>*/}
      {/*  ))}*/}
      {/*</nav>*/}
    </div>
  );
}
