import { getDoc, getTree } from "@docsmith/runtime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params["*"];

  return {
    doc: getDoc(slug),
    tree: getTree(),
  };
}

import { Route } from "../../../.react-router/types/app/routes/docs/+types/slug";
import {
  Breadcrumbs, BreadcrumbsItem,
  BreadcrumbsList, BreadcrumbsSeparator,
  OnThisPage,
  OnThisPageItem,
  OnThisPageList
} from "@docsmith/react";
import {Fragment, useState} from "react";
import {Link} from "react-router";

export default function DocsPage({ params, loaderData }: Route.ComponentProps) {
  const { doc, tree } = loaderData;
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
                    // For directories (non-final items), use a span instead of Link
                    as={index === items.length - 1 ? Link : 'span'}
                    // Only pass the 'to' prop if it's the final item
                    {...(index === items.length - 1 ? { to: `/docs/${item.slug}` } : {})}
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {doc.content}
        </ReactMarkdown>
      </article>
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
                    as={"a"} // For custom routing components
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
