import { Building2, Home, Shield, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800 py-24 dark:from-blue-900 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:4rem]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              About RentEase
            </h1>
            <p className="text-lg leading-relaxed text-blue-100">
              We're on a mission to make property rental simple, transparent, and efficient for everyone.
              Whether you're looking for your next home or managing multiple properties, RentEase is here to
              help.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800">
            <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Wide Selection</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse through thousands of verified properties across different locations and price ranges.
            </p>
          </div>
          <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800">
            <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Secure Platform</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your safety is our priority. All listings and users are verified for your peace of mind.
            </p>
          </div>
          <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800">
            <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Property Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Powerful tools for property owners to manage listings, tenants, and maintenance requests.
            </p>
          </div>
          <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800">
            <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Community First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join our community of happy tenants and landlords, backed by 24/7 customer support.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">Our Team</h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group text-center">
              <div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full transition-transform group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                  alt="John Doe"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">John Doe</h3>
              <p className="text-blue-600 dark:text-blue-400">CEO & Founder</p>
            </div>
            <div className="group text-center">
              <div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full transition-transform group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                  alt="Jane Smith"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Jane Smith</h3>
              <p className="text-blue-600 dark:text-blue-400">Head of Operations</p>
            </div>
            <div className="group text-center">
              <div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full transition-transform group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                  alt="Mike Johnson"
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Mike Johnson</h3>
              <p className="text-blue-600 dark:text-blue-400">Lead Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 dark:from-blue-900 dark:to-blue-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div className="group">
              <div className="mb-2 text-4xl font-bold text-white">10K+</div>
              <div className="text-lg text-blue-100">Active Listings</div>
            </div>
            <div className="group">
              <div className="mb-2 text-4xl font-bold text-white">50K+</div>
              <div className="text-lg text-blue-100">Happy Users</div>
            </div>
            <div className="group">
              <div className="mb-2 text-4xl font-bold text-white">100+</div>
              <div className="text-lg text-blue-100">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}