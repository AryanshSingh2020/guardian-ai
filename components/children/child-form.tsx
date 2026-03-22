"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { childProfileSchema, type ChildProfileInput } from "@/lib/validators";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChildFormProps {
  initialData?: ChildProfileInput & { id?: string };
}

export function ChildForm({ initialData }: ChildFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [familyHistoryInput, setFamilyHistoryInput] = useState("");

  const form = useForm<ChildProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(childProfileSchema) as any,
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      gender: initialData?.gender || "male",
      bloodGroup: initialData?.bloodGroup || undefined,
      allergies: initialData?.allergies || [],
      chronicConditions: initialData?.chronicConditions || [],
      familyMedicalHistory: initialData?.familyMedicalHistory || [],
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: ChildProfileInput) => {
    setLoading(true);
    try {
      const url = initialData?.id
        ? `/api/children/${initialData.id}`
        : "/api/children";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(
        initialData?.id
          ? "Child profile updated successfully"
          : "Child profile created successfully"
      );
      router.push("/children");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addToList = (
    field: "allergies" | "chronicConditions" | "familyMedicalHistory",
    value: string,
    setter: (v: string) => void
  ) => {
    if (!value.trim()) return;
    const current = form.getValues(field) || [];
    if (!current.includes(value.trim())) {
      form.setValue(field, [...current, value.trim()]);
    }
    setter("");
  };

  const removeFromList = (
    field: "allergies" | "chronicConditions" | "familyMedicalHistory",
    index: number
  ) => {
    const current = form.getValues(field) || [];
    form.setValue(
      field,
      current.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Allergies */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Allergies</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergy (e.g., Peanuts)"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addToList("allergies", allergyInput, setAllergyInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    addToList("allergies", allergyInput, setAllergyInput)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(form.watch("allergies") || []).map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeFromList("allergies", i)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chronic Conditions</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add condition (e.g., Asthma)"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addToList(
                        "chronicConditions",
                        conditionInput,
                        setConditionInput
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    addToList(
                      "chronicConditions",
                      conditionInput,
                      setConditionInput
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(form.watch("chronicConditions") || []).map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeFromList("chronicConditions", i)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Family Medical History */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Family Medical History
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add family history (e.g., Diabetes)"
                  value={familyHistoryInput}
                  onChange={(e) => setFamilyHistoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addToList(
                        "familyMedicalHistory",
                        familyHistoryInput,
                        setFamilyHistoryInput
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    addToList(
                      "familyMedicalHistory",
                      familyHistoryInput,
                      setFamilyHistoryInput
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(form.watch("familyMedicalHistory") || []).map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeFromList("familyMedicalHistory", i)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional health notes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Update Profile" : "Create Profile"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
