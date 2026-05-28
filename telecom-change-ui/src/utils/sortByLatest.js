const toTimestamp = (value) => {
  if (!value) return 0

  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

const readValue = (item, path) => {
  if (!path) return null

  return path.split('.').reduce((current, segment) => {
    if (current == null) return null
    return current[segment]
  }, item)
}

export const sortByLatest = (items = [], fields = ['updatedAt', 'createdAt']) => {
  const fieldList = Array.isArray(fields) ? fields : [fields]

  const getLatestTimestamp = (item) => {
    for (const field of fieldList) {
      const value = typeof field === 'function' ? field(item) : readValue(item, field)
      const timestamp = toTimestamp(value)
      if (timestamp) return timestamp
    }

    return 0
  }

  return [...items].sort((left, right) => getLatestTimestamp(right) - getLatestTimestamp(left))
}