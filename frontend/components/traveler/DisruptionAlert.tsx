'use client'

import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { Disruption, ImpactItem, RecoveryOption } from '@/types/traveler'

interface DisruptionAlertProps {
  disruption: Disruption
  impactItems: ImpactItem[]
  recoveryOptions: RecoveryOption[]
  onSelectRecovery: (optionId: string) => void
}

const severityConfig = {
  low: {
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
    icon: Info,
  },
  medium: {
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-600',
    icon: AlertTriangle,
  },
  high: {
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    iconColor: 'text-orange-600',
    icon: AlertTriangle,
  },
  critical: {
    color: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-600',
    icon: AlertTriangle,
  },
}

const experienceImpactConfig = {
  very_low: { label: 'Very Low Impact', color: 'text-green-600' },
  low: { label: 'Low Impact', color: 'text-green-600' },
  medium: { label: 'Medium Impact', color: 'text-yellow-600' },
  high: { label: 'High Impact', color: 'text-orange-600' },
  very_high: { label: 'Very High Impact', color: 'text-red-600' },
}

export default function DisruptionAlert({
  disruption,
  impactItems,
  recoveryOptions,
  onSelectRecovery,
}: DisruptionAlertProps) {
  const severityInfo = severityConfig[disruption.severity]
  const SeverityIcon = severityInfo.icon

  const atRiskItems = impactItems.filter((item) => item.status === 'at_risk')
  const unaffectedItems = impactItems.filter((item) => item.status === 'unaffected')

  return (
    <div className="space-y-6">
      {/* Disruption Alert */}
      <div className={`rounded-lg border-2 p-6 ${severityInfo.color}`}>
        <div className="flex items-start">
          <SeverityIcon className={`w-6 h-6 mr-3 ${severityInfo.iconColor}`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{disruption.title}</h3>
            <p className="text-sm mb-4">{disruption.description}</p>
            <div className="flex items-center text-xs">
              <span className="font-medium">Severity:</span>
              <span className="ml-2 uppercase">{disruption.severity}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">Detected:</span>
              <span className="ml-2">{new Date(disruption.detected_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>

        {atRiskItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-gray-900">At Risk ({atRiskItems.length})</h4>
            </div>
            <div className="space-y-2">
              {atRiskItems.map((item) => (
                <div key={item.item_id} className="bg-orange-50 rounded p-3">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  {item.explanation && (
                    <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {unaffectedItems.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Unaffected ({unaffectedItems.length})</h4>
            </div>
            <div className="space-y-2">
              {unaffectedItems.slice(0, 3).map((item) => (
                <div key={item.item_id} className="bg-green-50 rounded p-3">
                  <p className="font-medium text-gray-900">{item.title}</p>
                </div>
              ))}
              {unaffectedItems.length > 3 && (
                <p className="text-sm text-gray-600 pl-3">
                  + {unaffectedItems.length - 3} more items
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recovery Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recovery Options</h3>
        <div className="space-y-4">
          {recoveryOptions.map((option) => {
            const impactInfo = experienceImpactConfig[option.experience_impact]

            return (
              <div
                key={option.id}
                className="bg-white rounded-lg shadow border-2 border-gray-200 hover:border-indigo-300 p-6 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{option.title}</h4>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Additional Cost</p>
                    <p
                      className={`text-xl font-bold ${
                        option.cost_delta > 0
                          ? 'text-red-600'
                          : option.cost_delta < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {option.cost_delta > 0 ? '+' : ''}₹{option.cost_delta.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{option.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Experience Impact</p>
                    <p className={`text-sm font-medium ${impactInfo.color}`}>{impactInfo.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Affected Items</p>
                    <p className="text-sm font-medium text-gray-900">
                      {option.affected_items.length} changes
                    </p>
                  </div>
                </div>

                {option.changes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Changes:</p>
                    <ul className="space-y-1">
                      {option.changes.map((change, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span className="capitalize">{change.change_type}:</span>
                          <span className="ml-1">{change.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => onSelectRecovery(option.id)}
                  className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Choose This Plan
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
