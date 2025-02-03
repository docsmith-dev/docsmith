import { getDoc } from "@docsmith/runtime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";


export async function loader({ params }: Route.LoaderArgs) {
  return {
    doc: getDoc(params.slug),
  };
}

import {Route} from "../../../.react-router/types/app/routes/docs/+types/slug";

export default function DocsPage({ params, loaderData }: Route.ComponentProps) {
  const { doc } = loaderData

  return (
    <div>
      <article>
        <header>
          <h1>{doc.frontmatter?.title || doc.title}</h1>
          {doc.frontmatter?.description && (
            <p>{doc.frontmatter.description}</p>
          )}
        </header>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {doc.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
