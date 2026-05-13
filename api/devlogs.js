import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGODB_URI
const DB_NAME = 'atlanticai_devlog'
const COLLECTION_NAME = 'devlogs'

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  return client.db(DB_NAME)
}

export default async function handler(req, res) {
  const { method } = req

  try {
    const db = await connectToDatabase()
    const collection = db.collection(COLLECTION_NAME)

    if (method === 'GET') {
      const devlogs = await collection.find({}).sort({ date: -1 }).toArray()
      return res.status(200).json(devlogs)
    }

    if (method === 'POST') {
      const { title, content, features, date } = req.body
      const adminToken = req.headers['x-admin-token']

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!title || !content) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const newDevlog = {
        title,
        content,
        features: features || [],
        date: date || new Date().toISOString(),
        createdAt: new Date(),
      }

      const result = await collection.insertOne(newDevlog)
      return res.status(201).json({ ...newDevlog, _id: result.insertedId })
    }

    if (method === 'PUT') {
      const { id, title, content, features } = req.body
      const adminToken = req.headers['x-admin-token']

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { ObjectId } = await import('mongodb')
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, content, features, updatedAt: new Date() } }
      )

      return res.status(200).json({ success: result.modifiedCount > 0 })
    }

    if (method === 'DELETE') {
      const { id } = req.body
      const adminToken = req.headers['x-admin-token']

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { ObjectId } = await import('mongodb')
      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      return res.status(200).json({ success: result.deletedCount > 0 })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Devlog handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
