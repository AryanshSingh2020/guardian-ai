import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import { Baby, Plus, Calendar, Droplets, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getAge(dob: string) {
  const birthDate = new Date(dob);
  const years = differenceInYears(new Date(), birthDate);
  const months = differenceInMonths(new Date(), birthDate) % 12;
  if (years === 0) return `${months} months`;
  return `${years}y ${months}m`;
}

export default async function ChildrenPage() {
  const user = await requireUser();
  const childrenList = await db
    .select()
    .from(children)
    .where(eq(children.userId, user.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Children</h1>
          <p className="text-muted-foreground">
            Manage your children&apos;s health profiles.
          </p>
        </div>
        <Link href="/children/new">
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </Link>
      </div>

      {childrenList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
              <Baby className="h-8 w-8 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold">No children added yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Create your first child profile to begin tracking health data.
            </p>
            <Link href="/children/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Child Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {childrenList.map((child) => (
            <Link key={child.id} href={`/children/${child.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={child.photoUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-lg font-bold text-white">
                        {child.firstName[0]}
                        {child.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">
                        {child.firstName} {child.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {getAge(child.dateOfBirth)}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {child.gender}
                      </Badge>
                      {child.bloodGroup && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          <Droplets className="mr-1 h-3 w-3" />
                          {child.bloodGroup}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {((child.allergies as string[])?.length > 0 ||
                    (child.chronicConditions as string[])?.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {(child.allergies as string[])?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(child.allergies as string[]).slice(0, 3).map((a) => (
                            <Badge
                              key={a}
                              variant="secondary"
                              className="bg-red-50 text-red-700 text-xs dark:bg-red-900/20 dark:text-red-400"
                            >
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {a}
                            </Badge>
                          ))}
                          {(child.allergies as string[]).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(child.allergies as string[]).length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
