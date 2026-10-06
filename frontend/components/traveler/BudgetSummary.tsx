import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { BudgetSummary as BudgetSummaryType } from '@/types/traveler'

interface BudgetSummaryProps {
  summary: BudgetSummaryType
}

export default function BudgetSummary({ summary }: BudgetSummaryProps) {
  const spent = summary.total_confirmed
  const estimated = summary.total_estimated
  const remaining = summary.remaining
  const percentageUsed = (spent / (spent + remaining)) * 100

  return (
    <div className="space-y-6">
      {/* Overall Budget Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Total Budget</h2>
          <DollarSign className="w-6 h-6" />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm opacity-90">Budget Allocated</p>
            <p className="text-3xl font-bold">₹{(spent + remaining).toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-90">Confirmed</p>
              <p className="text-xl font-semibold">₹{spent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Remaining</p>
              <p className="text-xl font-semibold">₹{remaining.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{percentageUsed.toFixed(1)}% used</span>
              <span>{(100 - percentageUsed).toFixed(1)}% available</span>
            </div>
            <div className="w-full bg-indigo-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
          </div>

          {estimated > spent && (
            <div className="pt-3 border-t border-indigo-400">
              <p className="text-sm opacity-90">Estimated Total</p>
              <p className="text-lg font-semibold">₹{estimated.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">
                {estimated > spent + remaining ? (
                  <span className="flex items-center text-red-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Over budget by ₹{(estimated - (spent + remaining)).toLocaleString()}
                  </span>
                ) : (
                  <span className="flex items-center text-green-200">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    Within budget
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {summary.breakdown.map((category) => {
            const categoryPercentage = (category.confirmed / spent) * 100 || 0
            const isOverEstimate = category.confirmed > category.estimated

            return (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category.category}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{category.confirmed.toLocaleString()}
                    </p>
                    {category.estimated !== category.confirmed && (
                      <p className="text-xs text-gray-500">
                        Est: ₹{category.estimated.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverEstimate ? 'bg-orange-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                    />
                  </div>
                  {category.estimated > 0 && (
                    <div
                      className="absolute top-0 h-2 w-0.5 bg-gray-400"
                      style={{
                        left: `${Math.min((category.estimated / spent) * 100, 100)}%`,
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {categoryPercentage.toFixed(1)}% of confirmed spending
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cost Summary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmed
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.breakdown.map((category) => {
              const diff = category.confirmed - category.estimated

              return (
                <tr key={category.category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ₹{category.estimated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ₹{category.confirmed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span
                      className={`inline-flex items-center ${
                        diff > 0
                          ? 'text-red-600'
                          : diff < 0
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {diff > 0 ? '+' : ''}₹{diff.toLocaleString()}
                    </span>
                  </td>
                </tr>
              )
            })}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                ₹{summary.breakdown.reduce((sum, c) => sum + c.estimated, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                ₹{summary.total_confirmed.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span
                  className={`inline-flex items-center ${
                    summary.total_confirmed > summary.total_estimated
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {summary.total_confirmed > summary.total_estimated ? '+' : ''}₹
                  {(summary.total_confirmed - summary.total_estimated).toLocaleString()}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
