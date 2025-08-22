import { type ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navigation can be added here */}
      <main className="flex-1">{children}</main>
      {/* Footer can be added here */}
    </div>
  );
}
