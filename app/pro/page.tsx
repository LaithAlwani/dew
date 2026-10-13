import { ProWorkspace } from "@/components/pro/ProWorkspace";

export default function ProHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-navy">Your workspace</h1>
      <ProWorkspace />
    </div>
  );
}
