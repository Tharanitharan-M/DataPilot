import { auth } from "@clerk/nextjs/server";
import { ArrowRight, BarChart3, Database, Globe, Shield, Users, Zap } from "lucide-react";
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
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                DataPilot
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="font-medium text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="mb-6 text-5xl leading-tight font-bold text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
              Your Complete Data
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management Solution
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-xl text-slate-600 sm:text-2xl dark:text-slate-300">
              Streamline your data workflows with powerful analytics, secure storage, and real-time
              collaboration tools built for modern teams.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex items-center space-x-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl transition-all duration-200 hover:bg-blue-700 hover:shadow-2xl"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-900 shadow-md transition-all duration-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 px-4 py-20 sm:px-6 lg:px-8 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 dark:text-white">
            Why Choose DataPilot?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Lightning Fast
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Process and analyze massive datasets in seconds with our optimized data pipeline.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Secure & Compliant
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Enterprise-grade security with end-to-end encryption and compliance certifications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Advanced Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Gain actionable insights with powerful visualization and AI-powered analytics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Team Collaboration
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Work together seamlessly with real-time collaboration and role-based access.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                <Database className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Scalable Storage
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Store unlimited data with automatic scaling and redundancy for reliability.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
                <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Global Infrastructure
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Deploy worldwide with low-latency access from our global CDN network.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl dark:text-white">
            Ready to Transform Your Data?
          </h2>
          <p className="mb-12 text-xl text-slate-600 dark:text-slate-300">
            Join thousands of teams already using DataPilot to power their data operations.
          </p>
          <Link
            href="/sign-up"
            className="hover:shadow-3xl inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
          >
            <span>Get Started Now</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
        <div className="mx-auto max-w-7xl text-center text-slate-400">
          <p>&copy; 2025 DataPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
