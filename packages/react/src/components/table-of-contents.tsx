import React, { forwardRef, useCallback, useState } from "react";
import { useDocsData } from "../hooks/useDocsData";

interface TreeItem {
  type: 'group' | 'doc';
  name: string;
  label?: string;
  slug?: string;
  items?: TreeItem[];
}

interface RenderGroupProps {
  item: TreeItem;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (groupName: string) => void;
}

interface RenderDocProps {
  item: TreeItem;
}

interface TableOfContentsProps {
  renderGroup?: (props: RenderGroupProps) => React.ReactElement;
  renderDoc?: (props: RenderDocProps) => React.ReactElement;
  defaultExpanded?: boolean;
}

export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(
  ({ renderGroup, renderDoc, defaultExpanded = true, ...props }, ref) => {
    const { tree } = useDocsData();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
      new Set(
        defaultExpanded
          ? tree
            .filter((item: TreeItem) => item.type === "group")
            .map((item: TreeItem) => item.name)
          : []
      )
    );

    const toggleGroup = useCallback((groupName: string) => {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(groupName)) {
          next.delete(groupName);
        } else {
          next.add(groupName);
        }
        return next;
      });
    }, []);

    const defaultRenderGroup = ({ item, children, isExpanded, onToggle }: RenderGroupProps) => (
      <li key={item.name}>
        <button
          onClick={() => onToggle(item.name)}
          aria-expanded={isExpanded}
          aria-controls={`group-${item.name}`}
          type="button"
        >
          {item.label || item.name}
        </button>
        <div
          id={`group-${item.name}`}
          role="region"
          aria-labelledby={`group-${item.name}-button`}
          hidden={!isExpanded}
        >
          {children}
        </div>
      </li>
    );

    const defaultRenderDoc = ({ item }: RenderDocProps) => (
      <li key={item.slug}>
        <a
          href={item.slug}
          aria-current={location.pathname === item.slug ? "page" : undefined}
        >
          {item.label || item.name}
        </a>
      </li>
    );

    const renderTreeItem = (item: TreeItem) => {
      if (item.type === "group") {
        const isExpanded = expandedGroups.has(item.name);
        const groupChildren = (
          <ul>{item.items?.map((subItem) => renderTreeItem(subItem))}</ul>
        );

        return (renderGroup || defaultRenderGroup)({
          item,
          children: groupChildren,
          isExpanded,
          onToggle: toggleGroup,
        });
      }
      return (renderDoc || defaultRenderDoc)({ item });
    };

    return (
      <nav ref={ref} aria-label="Table of contents" {...props}>
        <ul>{tree.map((item) => renderTreeItem(item))}</ul>
      </nav>
    );
  }
);

TableOfContents.displayName = "TableOfContents";