import AdminGuard from "@/components/admin/AdminGuard";
import AdminNav from "@/components/admin/AdminNav";
import CompanyManager from "@/components/admin/CompanyManager";

export const metadata = {
  title: "Manage Companies | Admin | Parakh",
  description: "Create, update, and manage hiring companies on Parakh.",
};

export default function AdminCompaniesPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminNav
          title="Company Management"
          description="View, search, create, update, and delete hiring partner profiles."
        />
        <CompanyManager />
      </main>
    </AdminGuard>
  );
}
