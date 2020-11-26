import React from "react";
import ReactTooltop from "react-tooltip";
import { constants } from "helpers";

const isDark = localStorage.getItem(constants.localStorage.isDark);
const defaultType = isDark ? "light" : "dark";

// A react tooltip wrapper to define a tooltip type depending on the theme
export default function ThemeTooltip({
  type = defaultType,
  children,
  ...props
}) {
  return (
    
    <ReactTooltop
      //@ts-ignore
      type={type}
      {...props}
    >
      {children}
    </ReactTooltop>
  );
}
