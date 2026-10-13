import { AdminApprovals } from "@/components/admin/AdminApprovals";

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-navy">Professional approvals</h1>
      <AdminApprovals />
    </div>
  );
}
