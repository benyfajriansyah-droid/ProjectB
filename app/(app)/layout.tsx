import Sidebar from "./sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-[74px] lg:pl-[212px]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-7 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
