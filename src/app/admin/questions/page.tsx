import AdminGuard from "@/components/admin/AdminGuard";
import AdminNav from "@/components/admin/AdminNav";
import QuestionManager from "@/components/admin/QuestionManager";

export const metadata = {
  title: "Manage Questions | Admin | Parakh",
  description: "Create, update, and manage interview practice questions on Parakh.",
};

export default function AdminQuestionsPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminNav
          title="Question Management"
          description="View, search, filter, paginate, create, update, and delete interview questions."
        />
        <QuestionManager />
      </main>
    </AdminGuard>
  );
}
