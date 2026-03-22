import { ChildForm } from "@/components/children/child-form";

export default function NewChildPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Child</h1>
        <p className="text-muted-foreground">
          Create a health profile for your child.
        </p>
      </div>
      <ChildForm />
    </div>
  );
}
