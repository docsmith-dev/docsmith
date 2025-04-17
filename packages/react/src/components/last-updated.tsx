import * as React from "react";

interface LastUpdatedRenderProps {
  /**
   * ISO string date of last update
   */
  date: string;
  /**
   * Formatted date string in user's locale
   */
  formattedDate: string;
  /**
   * Relative time string (e.g. "2 days ago")
   */
  relativeTime: string;
}

interface LastUpdatedProps {
  /**
   * ISO string date
   */
  date: string;
  /**
   * Locale for date formatting
   * @default 'en'
   */
  locale?: string;
  /**
   * Custom date formatting options
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  /**
   * Children render function or React nodes
   */
  children:
    | React.ReactNode
    | ((props: LastUpdatedRenderProps) => React.ReactNode);
}

/**
 * Component for displaying the last updated date of a document
 */
export function LastUpdated({
  date,
  locale = "en",
  formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  children,
  ...props
}: LastUpdatedProps) {
  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, formatOptions).format(
      new Date(date)
    );
  }, [date, locale, formatOptions]);

  const relativeTime = React.useMemo(() => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const now = new Date();
    const then = new Date(date);
    const diffInDays = Math.floor(
      (then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (Math.abs(diffInDays) < 1) {
      return rtf.format(0, "day");
    } else if (Math.abs(diffInDays) < 30) {
      return rtf.format(diffInDays, "day");
    } else if (Math.abs(diffInDays) < 365) {
      return rtf.format(Math.floor(diffInDays / 30), "month");
    } else {
      return rtf.format(Math.floor(diffInDays / 365), "year");
    }
  }, [date, locale]);

  return (
    <time dateTime={date} {...props}>
      {typeof children === "function"
        ? children({ date, formattedDate, relativeTime })
        : children}
    </time>
  );
}
