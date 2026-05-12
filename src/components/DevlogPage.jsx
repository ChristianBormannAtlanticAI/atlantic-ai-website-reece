import { useEffect, useState } from 'react'
import { CalendarDays, Zap } from 'lucide-react'

export default function DevlogPage() {
  const [devlogs, setDevlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevlogs = async () => {
      try {
        const response = await fetch('/api/devlogs')
        if (response.ok) {
          const data = await response.json()
          setDevlogs(data)
        }
      } catch (err) {
        console.error('Error fetching devlogs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDevlogs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading devlogs...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Chatbot Devlog</h1>
          <p className="text-slate-400">Latest updates and feature releases</p>
        </div>

        {devlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No devlogs yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {devlogs.map((devlog) => (
              <div
                key={devlog._id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-cyan-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">{devlog.title}</h2>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CalendarDays size={16} />
                    {new Date(devlog.date).toLocaleDateString('en-ZA')}
                  </div>
                </div>

                <p className="text-slate-300 mb-4 leading-relaxed">{devlog.content}</p>

                {devlog.features && devlog.features.length > 0 && (
                  <div className="mt-6">
                    <p className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
                      <Zap size={18} className="text-cyan-500" />
                      Features
                    </p>
                    <ul className="space-y-2">
                      {devlog.features.map((feature, idx) => (
                        <li key={idx} className="text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
