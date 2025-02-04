import * as React from "react";
import { Doc, DocHeading } from "@docsmith/core";

interface NestedHeading extends DocHeading {
  children: NestedHeading[];
}

interface OnThisPageBaseProps {
  doc: Doc;
  minLevel?: number;
  maxLevel?: number;
  activeId?: string | null;
  onHeadingIntersect?: (headingId: string) => void;
}

interface OnThisPageRenderProps {
  headings: NestedHeading[];
  activeId: string | null;
}

type OnThisPageRenderFunction = (props: OnThisPageRenderProps) => React.ReactNode;

type OnThisPageProps = OnThisPageBaseProps &
  Omit<React.ComponentPropsWithoutRef<"nav">, keyof OnThisPageBaseProps> & {
  children: OnThisPageRenderFunction | React.ReactNode;
};

function createHeadingTree(headings: DocHeading[]): NestedHeading[] {
  const result: NestedHeading[] = [];
  const stack: NestedHeading[] = [];

  headings.forEach((heading) => {
    const nestedHeading = { ...heading, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(nestedHeading);
    } else {
      stack[stack.length - 1].children.push(nestedHeading);
    }

    stack.push(nestedHeading);
  });

  return result;
}

export function OnThisPage({
                             doc,
                             children,
                             className,
                             minLevel = 2,
                             maxLevel = 3,
                             activeId = null,
                             onHeadingIntersect,
                             ...props
                           }: OnThisPageProps) {
  const nestedHeadings = React.useMemo(() => {
    const filteredHeadings =
      doc?.headings?.filter(
        (heading) => heading.level >= minLevel && heading.level <= maxLevel
      ) ?? [];

    return createHeadingTree(filteredHeadings);
  }, [doc?.headings, minLevel, maxLevel]);

  // Only set up intersection observer if we have a callback
  React.useEffect(() => {
    if (!doc?.headings?.length || !onHeadingIntersect) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onHeadingIntersect(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    const elements = doc.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [doc?.headings, onHeadingIntersect]);

  if (!doc?.headings?.length) {
    return null;
  }

  return (
    <nav className={className} aria-label="On this page" {...props}>
      {typeof children === 'function'
        ? (children as OnThisPageRenderFunction)({ headings: nestedHeadings, activeId })
        : children}
    </nav>
  );
}

// OnThisPageList stays the same
interface OnThisPageListProps extends React.ComponentPropsWithoutRef<"ul"> {
  children: React.ReactNode;
}

export function OnThisPageList({ children, ...props }: OnThisPageListProps) {
  return (
    <ul role="list" {...props}>
      {children}
    </ul>
  );
}

// OnThisPageItem stays the same
interface OnThisPageItemBaseProps {
  heading: NestedHeading;
  active?: boolean;
  as?: React.ElementType;
  children?: React.ReactNode;
}

type OnThisPageItemProps = OnThisPageItemBaseProps &
  Omit<React.ComponentPropsWithoutRef<"li">, keyof OnThisPageItemBaseProps>;

export function OnThisPageItem({
                                 heading,
                                 active,
                                 as: Component = "a",
                                 children,
                                 ...props
                               }: OnThisPageItemProps) {
  // Add null checks and default to empty array if children is undefined
  const safeChildren = heading.children || [];

  return (
    <li {...props}>
      <Component
        href={`#${heading.id}`}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          document.getElementById(heading.id)?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        aria-current={active ? "location" : undefined}
      >
        {children || heading.text}
      </Component>
      {safeChildren.length > 0 && (
        <OnThisPageList>
          {safeChildren.map((childHeading) => (
            <OnThisPageItem
              key={childHeading.id}
              heading={childHeading}
              as={Component}
            />
          ))}
        </OnThisPageList>
      )}
    </li>
  );
}