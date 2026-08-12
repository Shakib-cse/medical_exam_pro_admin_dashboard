import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";
import { AdminAuthGuard } from "./_components/AdminAuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#edf0f4] flex flex-col lg:flex-row font-sans text-slate-800 antialiased">
        {/* Sidebar Navigation */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-6 w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
