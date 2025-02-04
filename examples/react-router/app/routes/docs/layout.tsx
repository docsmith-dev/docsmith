import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router";
import {
  TableOfContents,
  TableOfContentsGroup,
  TableOfContentsGroupLabel,
  TableOfContentsGroupContent,
  TableOfContentsList,
  TableOfContentsItem,
  TableOfContentsLink,
  Search,
  SearchInput,
  SearchResults,
  SearchResultItem,
} from "@docsmith/react";
import { getTree, getDocs } from "@docsmith/runtime";
import { useState } from "react";

export const loader = async () => {
  return {
    docs: getDocs(),
    tree: getTree(),
  };
};

export default function DocsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tree, docs } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <Search
        docs={docs}
        query={query}
        onQueryChange={setQuery}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onSelect={(doc) => {
          navigate(`/docs/${doc.slug}`);
          setQuery("");
        }}
      >
        {({ docs: results, query, setQuery, activeIndex, handleKeyDown }) => (
          <div onKeyDown={handleKeyDown}>
            <SearchInput query={query} onQueryChange={setQuery} />
            <SearchResults>
              {results.map((doc, index) => (
                <SearchResultItem
                  key={doc.slug}
                  doc={doc}
                  active={index === activeIndex}
                >
                  {doc.title}
                </SearchResultItem>
              ))}
            </SearchResults>
          </div>
        )}
      </Search>

      <aside className="border-r">
        <TableOfContents tree={tree} currentPath={location.pathname}>
          {({ tree }) => (
            <>
              {tree.map((section) => {
                if (section.type === "group") {
                  return (
                    <TableOfContentsGroup key={section.name}>
                      <TableOfContentsGroupLabel>
                        {section.label}
                      </TableOfContentsGroupLabel>
                      <TableOfContentsGroupContent>
                        <TableOfContentsList>
                          {section.items?.map((item) => {
                            if (item.type === "group") {
                              return (
                                <TableOfContentsItem key={item.name}>
                                  <TableOfContentsGroup>
                                    <TableOfContentsGroupLabel>
                                      {item.label}
                                    </TableOfContentsGroupLabel>
                                    <TableOfContentsGroupContent>
                                      <TableOfContentsList>
                                        {item.items?.map((subItem) => (
                                          <TableOfContentsItem key={subItem.slug}>
                                            <TableOfContentsLink
                                              item={subItem}
                                              asChild
                                              isCurrent={subItem.slug === location.pathname}
                                            >
                                              <Link to={`/docs/${subItem.slug}`}>
                                                <span>{subItem.label}</span>
                                              </Link>
                                            </TableOfContentsLink>
                                          </TableOfContentsItem>
                                        ))}
                                      </TableOfContentsList>
                                    </TableOfContentsGroupContent>
                                  </TableOfContentsGroup>
                                </TableOfContentsItem>
                              );
                            }
                            return (
                              <TableOfContentsItem key={item.slug}>
                                <TableOfContentsLink
                                  item={item}
                                  asChild
                                  isCurrent={item.slug === location.pathname}
                                >
                                  <Link to={`/docs/${item.slug}`}>
                                    <span>{item.label}</span>
                                  </Link>
                                </TableOfContentsLink>
                              </TableOfContentsItem>
                            );
                          })}
                        </TableOfContentsList>
                      </TableOfContentsGroupContent>
                    </TableOfContentsGroup>
                  );
                }

                return (
                  <TableOfContentsList key={section.name}>
                    <TableOfContentsItem>
                      <TableOfContentsLink item={section} asChild>
                        <Link to={`/docs/${section.slug}`}>
                          <span>{section.label}</span>
                        </Link>
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
