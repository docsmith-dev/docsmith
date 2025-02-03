import {Outlet, useLoaderData, useLocation} from "react-router";
import {
  TableOfContents,
  TableOfContentsGroup,
  TableOfContentsGroupLabel,
  TableOfContentsGroupContent,
  TableOfContentsList,
  TableOfContentsItem,
  TableOfContentsLink,
} from "@docsmith/react";
import {
  getTree,
  getDocs,
} from "@docsmith/runtime"

export const loader = async () => {
  return {
    docs: getTree(),
    tree: getTree(),
  }
}

export default function DocsLayout() {
  const location = useLocation();
  const { tree } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <aside className="border-r">
        <TableOfContents tree={tree} currentPath={location.pathname}>
          {({ tree }) => (
            <>
              {tree.map((section) => {
                if (section.type === "group" && section.items) {
                  return (
                    <TableOfContentsGroup key={section.name}>
                      <TableOfContentsGroupLabel>
                        {section.label}
                      </TableOfContentsGroupLabel>
                      <TableOfContentsGroupContent>
                        <TableOfContentsList>
                          {section.items.map((item) => (
                            <TableOfContentsItem key={item.slug}>
                              <TableOfContentsLink item={item} asChild>
                                <a href={`/docs/${item.slug}`}>
                                  {item.icon && (
                                    <item.icon className="mr-2 h-4 w-4" />
                                  )}
                                  <span>{item.label}</span>
                                </a>
                              </TableOfContentsLink>
                            </TableOfContentsItem>
                          ))}
                        </TableOfContentsList>
                      </TableOfContentsGroupContent>
                    </TableOfContentsGroup>
                  );
                }

                return (
                  <TableOfContentsList key={section.name}>
                    <TableOfContentsItem>
                      <TableOfContentsLink item={section} asChild>
                        <a href={`/docs/${section.slug}`}>
                          {section.icon && (
                            <section.icon className="mr-2 h-4 w-4" />
                          )}
                          <span>{section.label}</span>
                        </a>
                      </TableOfContentsLink>
                    </TableOfContentsItem>
                  </TableOfContentsList>
                );
              })}
            </>
          )}
        </TableOfContents>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
