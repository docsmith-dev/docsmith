import * as React from "react";
import { DocHeading } from "@docsmith/core";
import { useDoc } from "../hooks/useDoc";

interface OnThisPageBaseProps {
  children: (props: OnThisPageRenderProps) => React.ReactNode;
  minLevel?: number;
  maxLevel?: number;
}

type OnThisPageProps = OnThisPageBaseProps &
  Omit<React.ComponentPropsWithoutRef<"nav">, keyof OnThisPageBaseProps>;

interface OnThisPageRenderProps {
  headings: DocHeading[];
  activeId: string | null;
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

  const filteredHeadings = React.useMemo(() => {
    return (
      doc?.headings?.filter(
        (heading) => heading.level >= minLevel && heading.level <= maxLevel,
      ) ?? []
    );
  }, [doc?.headings, minLevel, maxLevel]);

  React.useEffect(() => {
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

    const elements = filteredHeadings.map((heading) =>
      document.getElementById(heading.id),
    );

    elements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      elements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [filteredHeadings]);

  return (
    <nav className={className} aria-label="On this page" {...props}>
      {children({ headings: filteredHeadings, activeId })}
    </nav>
  );
}
OnThisPage.displayName = "OnThisPage";

interface OnThisPageListProps extends React.ComponentPropsWithoutRef<"ul"> {
  children: React.ReactNode;
}

export function OnThisPageList({
  children,
  className,
  ...props
}: OnThisPageListProps) {
  return (
    <ul className={className} role="list" {...props}>
      {children}
    </ul>
  );
}
OnThisPageList.displayName = "OnThisPageList";

interface OnThisPageItemBaseProps {
  heading: DocHeading;
  active?: boolean;
  onClick?: (heading: DocHeading) => void;
  children?: React.ReactNode;
}

type OnThisPageItemProps = OnThisPageItemBaseProps &
  Omit<React.ComponentPropsWithoutRef<"li">, keyof OnThisPageItemBaseProps>;

export function OnThisPageItem({
  heading,
  active,
  onClick,
  className,
  children,
  ...props
}: OnThisPageItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
    onClick?.(heading);
  };

  return (
    <li
      className={className}
      style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
      {...props}
    >
      <a
        href={`#${heading.id}`}
        onClick={handleClick}
        aria-current={active ? "location" : undefined}
      >
        {children || heading.text}
      </a>
    </li>
  );
}
OnThisPageItem.displayName = "OnThisPageItem";

interface OnThisPageTreeBaseProps {
  minLevel?: number;
  maxLevel?: number;
  onHeadingClick?: (heading: DocHeading) => void;
  isActiveHeading?: (heading: DocHeading, activeId: string | null) => boolean;
}

type OnThisPageTreeProps = OnThisPageTreeBaseProps &
  Omit<React.ComponentPropsWithoutRef<"nav">, keyof OnThisPageTreeBaseProps>;

export function OnThisPageTree({
  minLevel = 2,
  maxLevel = 3,
  onHeadingClick,
  isActiveHeading,
  className,
  ...props
}: OnThisPageTreeProps) {
  return (
    <OnThisPage
      minLevel={minLevel}
      maxLevel={maxLevel}
      className={className}
      {...props}
    >
      {({ headings, activeId }) => (
        <OnThisPageList>
          {headings.map((heading) => (
            <OnThisPageItem
              key={heading.id}
              heading={heading}
              active={
                isActiveHeading
                  ? isActiveHeading(heading, activeId)
                  : heading.id === activeId
              }
              onClick={onHeadingClick}
            />
          ))}
        </OnThisPageList>
      )}
    </OnThisPage>
  );
}
OnThisPageTree.displayName = "OnThisPageTree";
