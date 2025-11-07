import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { 
  Database, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity, 
  BarChart3,
  Settings,
  Home,
  FolderOpen,
  Bell,
  Building2,
  UsersRound
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DataPilot
            </span>
          </div>
          
          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium"
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <FolderOpen className="h-5 w-5" />
              <span>Projects</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </a>
            
            {/* Organization Section */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Organization
              </p>
            </div>
            <a
              href="/organizations"
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <Building2 className="h-5 w-5" />
              <span>Organizations</span>
            </a>
            <a
              href="/organization/settings"
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <UsersRound className="h-5 w-5" />
              <span>Team Members</span>
            </a>
            <a
              href="/create-organization"
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Create Organization</span>
            </a>
            
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Account
              </p>
            </div>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    organizationSwitcherTrigger: "px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
                  }
                }}
                createOrganizationUrl="/create-organization"
                organizationProfileUrl="/organization/settings"
              />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat Card 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  +12.5%
                </span>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                Total Data
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                2.4 TB
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  +8.2%
                </span>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                Active Users
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                1,234
              </p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  +23.1%
                </span>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                Documents
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                8,567
              </p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  +15.3%
                </span>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                API Requests
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                45.2K
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: FileText,
                      title: "New document uploaded",
                      description: "Report-Q4-2024.pdf has been added to the system",
                      time: "2 minutes ago",
                      color: "blue"
                    },
                    {
                      icon: Users,
                      title: "Team member invited",
                      description: "Sarah Johnson joined the organization",
                      time: "1 hour ago",
                      color: "green"
                    },
                    {
                      icon: Activity,
                      title: "Data sync completed",
                      description: "Successfully synced 1.2GB of data",
                      time: "3 hours ago",
                      color: "purple"
                    },
                    {
                      icon: BarChart3,
                      title: "Report generated",
                      description: "Monthly analytics report is ready",
                      time: "5 hours ago",
                      color: "orange"
                    }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                      <div className={`h-10 w-10 bg-${activity.color}-100 dark:bg-${activity.color}-900 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-5 w-5 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-left flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Upload Data</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors text-left flex items-center space-x-2 border border-slate-200 dark:border-slate-600">
                    <Users className="h-5 w-5" />
                    <span>Invite Team</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors text-left flex items-center space-x-2 border border-slate-200 dark:border-slate-600">
                    <BarChart3 className="h-5 w-5" />
                    <span>Generate Report</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors text-left flex items-center space-x-2 border border-slate-200 dark:border-slate-600">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* Storage Info */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Storage Usage
                </h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                        2.4 TB / 5.0 TB
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-slate-600 dark:text-slate-400">
                        48%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      style={{ width: "48%" }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

