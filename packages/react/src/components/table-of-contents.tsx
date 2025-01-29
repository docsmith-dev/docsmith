import React, {forwardRef, useCallback, useState} from "react";
import {useDocsData} from "../hooks/useDocsData";


export const TableOfContents = forwardRef(
  ({renderGroup, renderDoc, defaultExpanded = true, ...props}, ref) => {
    const {tree} = useDocsData();
    const [expandedGroups, setExpandedGroups] = useState(
      new Set(
        defaultExpanded
          ? tree
            .filter((item) => item.type === "group")
            .map((item) => item.name)
          : []
      )
    );

    const toggleGroup = useCallback((groupName) => {
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

    const defaultRenderGroup = ({item, children, isExpanded, onToggle}) => (
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

    const defaultRenderDoc = ({item}) => (
      <li key={item.slug}>
        <a
          href={item.slug}
          aria-current={location.pathname === item.slug ? "page" : undefined}
        >
          {item.label || item.name}
        </a>
      </li>
    );

    const renderTreeItem = (item) => {
      if (item.type === "group") {
        const isExpanded = expandedGroups.has(item.name);
        const groupChildren = (
          <ul>{item.items.map((subItem) => renderTreeItem(subItem))}</ul>
        );

        return (renderGroup || defaultRenderGroup)({
          item,
          children: groupChildren,
          isExpanded,
          onToggle: toggleGroup,
        });
      }
      return (renderDoc || defaultRenderDoc)({item});
    };

    return (
      <nav ref={ref} aria-label="Table of contents" {...props}>
        <ul>{tree.map((item) => renderTreeItem(item))}</ul>
      </nav>
    );
  }
);

TableOfContents.displayName = "TableOfContents";
