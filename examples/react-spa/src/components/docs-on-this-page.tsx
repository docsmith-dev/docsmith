import { OnThisPage, OnThisPageItem, OnThisPageList } from "@docsmith/react";
import { Doc } from "@docsmith/core";

export const DocsOnThisPage = ({ currentDoc }: { currentDoc: Doc }) => {
  return (
    <OnThisPage doc={currentDoc}>
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
  );
};
