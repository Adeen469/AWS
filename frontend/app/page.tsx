import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Sparkles, Shield, Clock } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect('/traveler')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">TourFlow AI</h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Your Trip, Your Way
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create personalized tours powered by AI. No more fixed packages. Dynamic adaptation when
            plans change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg"
            >
              Get Started
              <Sparkles className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-indigo-600 bg-white rounded-lg hover:bg-gray-50 shadow-lg border border-indigo-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Planning</h3>
            <p className="text-gray-600">
              Get personalized itineraries based on your preferences, budget, and travel style.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dynamic Adaptation</h3>
            <p className="text-gray-600">
              Plans change? We automatically identify impacts and suggest smart recovery options.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Control</h3>
            <p className="text-gray-600">
              Customize every aspect of your trip. Add, remove, or replace activities anytime.
            </p>
          </div>
        </div>

        {/* Demo Flow */}
        <div className="mt-24 bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Share Preferences</h4>
              <p className="text-sm text-gray-600">
                Tell us your destination, dates, budget, and interests
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Creates Itinerary</h4>
              <p className="text-sm text-gray-600">
                Get a personalized day-by-day plan tailored to you
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Customize & Book</h4>
              <p className="text-sm text-gray-600">
                Adjust activities, see costs update, and book your trip
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Travel Worry-Free</h4>
              <p className="text-sm text-gray-600">
                Plans change? We help you adapt on the fly
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">Ready to plan your perfect trip?</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg"
          >
            Start Planning Now
            <Sparkles className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 TourFlow AI. Built for Hackathon PS ID-7.
          </p>
        </div>
      </footer>
    </div>
  )
}
