import { getDoc, getTree } from "@docsmith/runtime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MDXProvider } from "@mdx-js/react";
import { compile } from "@mdx-js/mdx";

import {
  Breadcrumbs,
  BreadcrumbsItem,
  BreadcrumbsList,
  BreadcrumbsSeparator,
  DocNavigation,
  DocNavigationLink,
  DocNavigationList,
  LastUpdated,
  OnThisPage,
  OnThisPageItem,
  OnThisPageList,
} from "@docsmith/react";
import { Fragment, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/button";

// Create a components map
const components = {
  Button,
  // Add other components that might be used in MDX
};

export async function loader({ params }) {
  const slug = params["*"];
  const doc = getDoc(slug);
  const tree = getTree();

  console.log("doc", doc);
  return {
    doc,
    tree,
  };
}

export default function DocsPage() {
  const { doc, tree } = useLoaderData();
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  return (
    <div>
      <article>
        <Breadcrumbs items={doc.breadcrumbs}>
          {({ items, separator }) => (
            <BreadcrumbsList>
              {items.map((item, index) => (
                <Fragment key={item.slug}>
                  <BreadcrumbsItem
                    item={item}
                    as={index === items.length - 1 ? Link : "span"}
                    {...(index === items.length - 1
                      ? { to: `/docs/${item.slug}` }
                      : {})}
                  />
                  {index < items.length - 1 && (
                    <BreadcrumbsSeparator>{separator}</BreadcrumbsSeparator>
                  )}
                </Fragment>
              ))}
            </BreadcrumbsList>
          )}
        </Breadcrumbs>
        <header>
          <h1>{doc.frontmatter?.title || doc.title}</h1>
          {doc.frontmatter?.description && <p>{doc.frontmatter.description}</p>}
        </header>
        <MDXProvider components={components}>
          {doc.path.endsWith(".mdx") ? (
            // For MDX files, doc.content should be a component from Vite's MDX plugin
            doc.content
          ) : (
            // Regular markdown content
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {doc.content}
            </ReactMarkdown>
          )}
        </MDXProvider>
      </article>
      <LastUpdated date={doc.lastUpdated}>
        {({ formattedDate, relativeTime }) => (
          <p>
            Last updated: {formattedDate} ({relativeTime})
          </p>
        )}
      </LastUpdated>
      <DocNavigation doc={doc}>
        {({ previous, next }) => (
          <DocNavigationList>
            {previous && (
              <Link to={`/docs/${previous.slug}`}>
                <DocNavigationLink
                  item={previous}
                  direction="previous"
                  label="Previous"
                  as={"div"}
                />
              </Link>
            )}
            {next && (
              <Link to={`/docs/${next.slug}`}>
                <DocNavigationLink
                  item={next}
                  direction="next"
                  label="Next"
                  as={"div"}
                />
              </Link>
            )}
          </DocNavigationList>
        )}
      </DocNavigation>
      <aside>
        <OnThisPage
          doc={doc}
          activeId={activeHeading}
          onHeadingIntersect={setActiveHeading}
        >
          {({ headings, activeId }) => {
            return (
              <OnThisPageList>
                {headings.map((heading) => (
                  <OnThisPageItem
                    key={heading.id}
                    heading={heading}
                    active={heading.id === activeId}
                    as={"a"}
                  >
                    {heading.text}
                  </OnThisPageItem>
                ))}
              </OnThisPageList>
            );
          }}
        </OnThisPage>
      </aside>
    </div>
  );
}
