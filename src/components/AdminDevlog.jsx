import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'

export default function AdminDevlog() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [features, setFeatures] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [existingDevlogs, setExistingDevlogs] = useState([])
  const [loadingDevlogs, setLoadingDevlogs] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      const fetchDevlogs = async () => {
        setLoadingDevlogs(true)
        try {
          const response = await fetch('/api/devlogs')
          if (response.ok) {
            const data = await response.json()
            setExistingDevlogs(data)
          }
        } catch (err) {
          console.error('Error fetching devlogs:', err)
        } finally {
          setLoadingDevlogs(false)
        }
      }
      fetchDevlogs()
    }
  }, [isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    setPasswordError('')

    const adminToken = prompt('Enter admin password:')
    if (adminToken === 'devlog-secure-token-12345') {
      setIsLoggedIn(true)
      setPassword('')
    } else {
      setPasswordError('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setTitle('')
    setContent('')
    setFeatures('')
    setPassword('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this devlog?')) return

    try {
      const response = await fetch('/api/devlogs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'devlog-secure-token-12345',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setSuccessMessage('Devlog deleted successfully!')
        setExistingDevlogs(existingDevlogs.filter(d => d._id !== id))
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setPasswordError('Failed to delete devlog')
      }
    } catch (err) {
      setPasswordError('Error deleting devlog')
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      const response = await fetch('/api/devlogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'devlog-secure-token-12345',
        },
        body: JSON.stringify({
          title,
          content,
          features: features.split(',').map(f => f.trim()).filter(f => f),
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setSuccessMessage('Devlog posted successfully!')
        setTitle('')
        setContent('')
        setFeatures('')
        setExistingDevlogs(prev => [created, ...prev])
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setPasswordError('Failed to post devlog')
      }
    } catch (err) {
      setPasswordError('Error posting devlog')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Devlog Admin</h1>
            <p className="text-slate-400 mb-6">Enter your password to continue</p>

            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 mb-4"
              />
              {passwordError && <p className="text-red-400 text-sm mb-4">{passwordError}</p>}
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded transition"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Devlog Post</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-slate-300 font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
              placeholder="e.g., New FAQ Bot Feature"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 font-semibold mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="6"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
              placeholder="Write the devlog content here..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 font-semibold mb-2">Features (comma-separated)</label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
              placeholder="e.g., Auto-responses, ML classification, A/B testing"
            />
          </div>

          {successMessage && <p className="text-green-400 text-sm mb-4">{successMessage}</p>}
          {passwordError && <p className="text-red-400 text-sm mb-4">{passwordError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Devlog'}
          </button>
        </form>
        <div className="mt-12 pt-8 border-t border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Existing Posts</h2>

          {loadingDevlogs ? (
            <p className="text-slate-400">Loading posts...</p>
          ) : existingDevlogs.length === 0 ? (
            <p className="text-slate-400">No devlogs yet.</p>
          ) : (
            <div className="space-y-4">
              {existingDevlogs.map((devlog) => (
                <div key={devlog._id} className="bg-slate-700 border border-slate-600 rounded p-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">{devlog.title}</h3>
                    <p className="text-slate-400 text-sm">{new Date(devlog.date).toLocaleDateString('en-ZA')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(devlog._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
