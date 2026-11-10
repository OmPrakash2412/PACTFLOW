import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System Showcase",
  description: "Living design system specification showcasing UI components across Loading, Empty, Error, and Success states.",
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

