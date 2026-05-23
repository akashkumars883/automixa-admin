import AdminLayoutWrapper from "./AdminLayoutWrapper";

export const metadata = {
  title: "Automixa Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </div>
  );
}

