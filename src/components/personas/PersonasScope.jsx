"use client";
import { PersonasUIProvider } from "./PersonasUI";
function PersonasScope({ children }) {
  return <div className="bfl-personas">
      <PersonasUIProvider>{children}</PersonasUIProvider>
    </div>;
}
export {
  PersonasScope
};
