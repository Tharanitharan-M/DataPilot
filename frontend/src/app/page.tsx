import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Database, MessageSquare, Sparkles, Shield, Zap, Brain, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/90 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                DataPilot
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="hidden sm:block font-semibold text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-4 pt-40 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              AI-Powered Database Queries
            </div>
            <h1 className="mb-8 text-6xl leading-tight font-extrabold text-slate-900 sm:text-7xl lg:text-8xl dark:text-white">
              Query Your Database
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                In Plain English
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-slate-600 sm:text-2xl dark:text-slate-300">
              Transform natural language into SQL queries instantly. No SQL knowledge required. 
              Connect your PostgreSQL database and start asking questions.
            </p>
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-200 hover:shadow-blue-500/25 hover:scale-105"
              >
                <span>Try It Free</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
              <Link
                href="/sign-in"
                className="rounded-2xl border-2 border-slate-300 bg-white/80 backdrop-blur px-10 py-5 text-lg font-bold text-slate-900 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Example Query Demo */}
          <div className="mt-20 mx-auto max-w-4xl">
            <div className="rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-800/80">
              <div className="mb-4 flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Ask a question:</span>
              </div>
              <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-lg font-medium text-slate-900 dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-white border-2 border-blue-200 dark:border-blue-800">
                "Show me the top 10 customers by revenue last month"
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <span>Instantly converted to optimized SQL and executed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/60 backdrop-blur px-4 py-24 sm:px-6 lg:px-8 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="mb-6 text-5xl font-extrabold text-slate-900 dark:text-white">
              Why DataPilot?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The fastest way to interact with your database without writing SQL
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                AI-Powered Queries
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Advanced language models understand your questions and generate optimized SQL queries automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Enterprise Security
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Bank-level encryption, secure connections, and compliance with industry standards keep your data safe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Lightning Fast
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Get results in milliseconds with intelligent query optimization and caching.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg group-hover:shadow-indigo-500/50 transition-shadow">
                <Search className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Query History
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Access and rerun past queries instantly. Build upon previous analysis with ease.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 border-2 border-transparent hover:border-red-200 dark:hover:border-red-800">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-red-500/50 transition-shadow">
                <Database className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Multiple Connections
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect to multiple PostgreSQL databases and switch between them seamlessly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Natural Language
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask questions in plain English - no SQL knowledge or training required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 text-center shadow-2xl">
            <h2 className="mb-6 text-5xl font-extrabold text-white">
              Ready to Get Started?
            </h2>
            <p className="mb-10 text-xl text-blue-100 max-w-2xl mx-auto">
              Join teams who are already querying their databases faster with natural language
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center space-x-3 rounded-2xl bg-white px-12 py-5 text-xl font-bold text-blue-600 shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-105"
            >
              <span>Start Querying Now</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
            <p className="mt-6 text-sm text-blue-100">
              No credit card required • Free to start
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
              DataPilot
            </span>
          </div>
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>&copy; 2025 DataPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
