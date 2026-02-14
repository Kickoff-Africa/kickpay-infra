import { DocsSidebar } from "./DocsSidebar";

export default function DocsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0">
      <DocsSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}
