import { OrganizationList } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href="/create-organization"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Organization</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Your Organizations
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage all your organizations and memberships
          </p>
        </div>

        <div className="flex justify-center">
          <OrganizationList
            appearance={{
              elements: {
                rootBox: "w-full max-w-4xl",
                card: "shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              },
            }}
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
          />
        </div>
      </main>
    </div>
  );
}


