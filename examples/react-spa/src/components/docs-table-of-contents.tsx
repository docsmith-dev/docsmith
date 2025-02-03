import {
  TableOfContents,
  TableOfContentsGroup,
  TableOfContentsGroupContent,
  TableOfContentsGroupLabel,
  TableOfContentsItem,
  TableOfContentsLink,
  TableOfContentsList,
} from "@docsmith/react";

export const DocsTableOfContents = () => {
  return (
    <TableOfContents>
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
                            <a href={item.slug}>
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
                    <a href={section.slug}>
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
  );
};
