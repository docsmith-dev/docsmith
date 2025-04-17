// In your DOC component (e.g., DocsPage.tsx)
import { useState, Fragment, useMemo } from "react";
import { getDoc, getTree } from "@docsmith/runtime";
import { Link, useLoaderData } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MDXProvider } from "@mdx-js/react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime"; // For mdx-js/mdx v2

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
import { Button } from "~/components/button";

// Create a components map
const components = {
  Button,
  // Add other components that might be used in MDX
};

import { bundleMDX } from "mdx-bundler";
import { getMDXComponent } from "mdx-bundler/client";


export async function loader({ params }) {
  const slug = params["*"];
  const doc = getDoc(slug);
  const tree = getTree();

  // For MDX files, compile the content on the server
  let mdxCode = null;
  if (doc?.isMDX) {
    try {
      const result = await bundleMDX({
        source: doc.content,
        mdxOptions(options) {
          options.remarkPlugins = [...(options.remarkPlugins || []), remarkGfm];
          options.rehypePlugins = [...(options.rehypePlugins || []), rehypeHighlight];
          return options;
        }
      });

      mdxCode = result.code;
    } catch (error) {
      console.error("Failed to compile MDX:", error);
    }
  }

  return {
    doc,
    tree,
    mdxCode
  };
}

export default function DocsPage() {
  const { doc, tree, mdxCode } = useLoaderData();
  const [activeHeading, setActiveHeading] = useState(null);

  // For MDX files, create a component from the compiled MDX
  const MDXContent = useMemo(() => {
    if (doc?.isMDX && mdxCode) {
      return getMDXComponent(mdxCode);
    }
    return null;
  }, [doc?.isMDX, mdxCode]);

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
          {doc.isMDX ? (
            MDXContent ? <MDXContent components={components} /> : <div>Loading MDX content...</div>
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