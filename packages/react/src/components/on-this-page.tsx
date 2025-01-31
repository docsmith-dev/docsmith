import * as React from "react";
import { DocHeading } from "@docsmith/core";
import { useDoc } from "../hooks/useDoc";

interface NestedHeading extends DocHeading {
  children: NestedHeading[];
}

interface OnThisPageBaseProps {
  children: (props: OnThisPageRenderProps) => React.ReactNode;
  minLevel?: number;
  maxLevel?: number;
}

type OnThisPageProps = OnThisPageBaseProps &
  Omit<React.ComponentPropsWithoutRef<"nav">, keyof OnThisPageBaseProps>;

interface OnThisPageRenderProps {
  headings: NestedHeading[];
  activeId: string | null;
}

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
  children,
  className,
  minLevel = 2,
  maxLevel = 3,
  ...props
}: OnThisPageProps) {
  const doc = useDoc();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const nestedHeadings = React.useMemo(() => {
    const filteredHeadings =
      doc?.headings?.filter(
        (heading) => heading.level >= minLevel && heading.level <= maxLevel,
      ) ?? [];

    return createHeadingTree(filteredHeadings);
  }, [doc?.headings, minLevel, maxLevel]);

  React.useEffect(() => {
    if (!doc?.headings?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" },
    );

    const elements = doc.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [doc?.headings]);

  // Don't render if there are no headings
  if (!doc?.headings?.length) {
    return null;
  }

  return (
    <nav className={className} aria-label="On this page" {...props}>
      {children({ headings: nestedHeadings, activeId })}
    </nav>
  );
}

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
      {heading.children.length > 0 && (
        <OnThisPageList>
          {heading.children.map((childHeading) => (
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
