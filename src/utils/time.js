// utils/time.js
import { parseISO, isValid, formatDistanceToNow } from "date-fns";

export const timeAgo = (value) => {
  const d =
    typeof value === "string"
      ? parseISO(value)
      : value instanceof Date
      ? value
      : null;
  return d && isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "";
};
