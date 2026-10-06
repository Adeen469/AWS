'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { CreateTripPayload } from '@/types/traveler'

const interests = [
  'Culture & History',
  'Adventure & Sports',
  'Nature & Wildlife',
  'Food & Cuisine',
  'Beach & Relaxation',
  'Shopping',
  'Nightlife',
  'Photography',
  'Art & Museums',
  'Local Experiences',
]

export default function CreateTripPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateTripPayload>({
    destination: '',
    start_date: '',
    end_date: '',
    number_of_travelers: 1,
    budget: 50000,
    accommodation_preference: 'mid_range',
    transportation_preference: 'mixed',
    interests: [],
    travel_style: 'moderate',
    pace: 'moderate',
    notes: '',
  })

  const updateFormData = (field: keyof CreateTripPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const validateStep = (step: number): boolean => {
    setError(null)
    
    switch (step) {
      case 1:
        if (!formData.destination.trim()) {
          setError('Please enter a destination')
          return false
        }
        if (!formData.start_date || !formData.end_date) {
          setError('Please select start and end dates')
          return false
        }
        const start = new Date(formData.start_date)
        const end = new Date(formData.end_date)
        if (end <= start) {
          setError('End date must be after start date')
          return false
        }
        return true
      
      case 2:
        if (formData.number_of_travelers < 1) {
          setError('Number of travelers must be at least 1')
          return false
        }
        if (formData.budget < 0) {
          setError('Budget must be a positive number')
          return false
        }
        return true
      
      case 3:
        if (formData.interests.length === 0) {
          setError('Please select at least one interest')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await createTrip(formData)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Mock success - redirect to trip details
      router.push('/traveler')
    } catch (err) {
      setError('Failed to create trip. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Trip</h1>
          <p className="mt-2 text-sm text-gray-600">
            Tell us about your travel preferences and we'll help you plan the perfect trip
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step < currentStep
                      ? 'bg-indigo-600 text-white'
                      : step === currentStep
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-12 sm:w-24 mx-2 ${
                      step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Destination</span>
            <span className="text-xs text-gray-600">Budget</span>
            <span className="text-xs text-gray-600">Preferences</span>
            <span className="text-xs text-gray-600">Review</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Destination & Dates */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Where would you like to go?</h2>
            
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                value={formData.destination}
                onChange={(e) => updateFormData('destination', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Paris, France"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData('start_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData('end_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Travelers */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Budget & Travelers</h2>
            
            <div>
              <label htmlFor="number_of_travelers" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Travelers
              </label>
              <input
                type="number"
                id="number_of_travelers"
                min="1"
                value={formData.number_of_travelers}
                onChange={(e) => updateFormData('number_of_travelers', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget (₹)
              </label>
              <input
                type="number"
                id="budget"
                min="0"
                step="1000"
                value={formData.budget}
                onChange={(e) => updateFormData('budget', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Total budget for the entire trip</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accommodation Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['budget', 'mid_range', 'luxury'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateFormData('accommodation_preference', type)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                      formData.accommodation_preference === type
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {type === 'mid_range' ? 'Mid-Range' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['public', 'private', 'rental', 'mixed'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateFormData('transportation_preference', type)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                      formData.transportation_preference === type
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests & Travel Style */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium text-left ${
                      formData.interests.includes(interest)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['relaxed', 'moderate', 'fast_paced'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => updateFormData('travel_style', style)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                      formData.travel_style === style
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {style === 'fast_paced' ? 'Fast-Paced' : style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Any special requirements or preferences..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review Your Trip</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Destination</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formData.destination}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(formData.start_date).toLocaleDateString()} - {new Date(formData.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Travelers</h3>
                  <p className="mt-1 text-gray-900">{formData.number_of_travelers}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ₹{formData.budget.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Accommodation</h3>
                  <p className="mt-1 text-gray-900 capitalize">
                    {formData.accommodation_preference.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transportation</h3>
                  <p className="mt-1 text-gray-900 capitalize">{formData.transportation_preference}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Interests</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Travel Style</h3>
                <p className="mt-1 text-gray-900 capitalize">
                  {formData.travel_style.replace('_', ' ')}
                </p>
              </div>

              {formData.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-gray-900">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? () => router.push('/traveler') : handleBack}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
