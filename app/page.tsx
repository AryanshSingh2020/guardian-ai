import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Shield,
  Brain,
  TrendingUp,
  Apple,
  Bell,
  FileText,
  ArrowRight,
  Heart,
  Activity,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Advanced Gemini AI analyzes health patterns to predict risks and provide personalized recommendations.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    description:
      "Monitor weight, height, and BMI with interactive charts compared against WHO growth standards.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Apple,
    title: "Nutrition Management",
    description:
      "Track meals, calories, and macronutrients with AI-suggested age-appropriate meal plans.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Automated vaccination reminders, medication schedules, and abnormal growth notifications.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: FileText,
    title: "Health Reports",
    description:
      "Generate comprehensive PDF reports for doctor visits with full health history and AI analysis.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with Clerk authentication. Your child's data is always protected.",
    gradient: "from-slate-500 to-gray-600",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "Health Metrics" },
  { value: "AI", label: "Powered Analysis" },
  { value: "24/7", label: "Monitoring" },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Guardian AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700"
              >
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              <Sparkles className="h-4 w-4" />
              AI-Powered Child Health Monitoring
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Protect Your Child&apos;s{" "}
              <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Health Future
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 sm:text-xl">
              Guardian AI transforms raw health data into meaningful insights.
              Track growth, monitor nutrition, and receive AI-powered
              predictions to keep your little ones healthy and thriving.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 shadow-lg shadow-sky-500/25"
                >
                  Start Monitoring Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative border-y bg-gray-50/50 py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-sm text-gray-500">
                Guardian AI Dashboard
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              <div className="rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 p-5 text-white">
                <Activity className="mb-2 h-6 w-6 opacity-80" />
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm opacity-80">Health Score</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white">
                <TrendingUp className="mb-2 h-6 w-6 opacity-80" />
                <div className="text-2xl font-bold">+2.3kg</div>
                <div className="text-sm opacity-80">Growth This Month</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-5 text-white">
                <Heart className="mb-2 h-6 w-6 opacity-80" />
                <div className="text-2xl font-bold">1,450</div>
                <div className="text-sm opacity-80">Avg Daily Calories</div>
              </div>
              <div className="col-span-2 rounded-xl border bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 text-sm font-medium text-gray-500">Growth Trend</div>
                <div className="flex items-end gap-1">
                  {[40, 55, 45, 60, 50, 70, 65, 75, 80, 72, 85, 90].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-sky-400 to-sky-500"
                        style={{ height: `${h}px` }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="rounded-xl border bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 text-sm font-medium text-gray-500">AI Assessment</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Low Risk</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  All metrics within healthy range. Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to monitor your child&apos;s health
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Comprehensive tools powered by artificial intelligence to ensure
              your child&apos;s optimal development.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border bg-white p-8 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-gray-50/50 py-24 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How it works
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create a Profile",
                description:
                  "Add your child's information including medical history, allergies, and current health data.",
              },
              {
                step: "02",
                title: "Track & Monitor",
                description:
                  "Log growth measurements, meals, and milestones. Our system monitors patterns automatically.",
              },
              {
                step: "03",
                title: "Get AI Insights",
                description:
                  "Receive personalized health assessments, risk predictions, and actionable wellness recommendations.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 px-8 py-16 text-center text-white shadow-2xl shadow-sky-500/25 sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start protecting your child&apos;s health today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-sky-100">
              Join thousands of parents who trust Guardian AI to monitor and
              predict their children&apos;s health outcomes.
            </p>
            <div className="mt-8">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 bg-white px-8 text-sky-600 hover:bg-sky-50"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Guardian AI</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Guardian AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
