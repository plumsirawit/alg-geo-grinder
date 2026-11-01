export type BookId = 'hartshorne' | 'vakil'

export interface Exercise {
  id: string
  bookId: BookId
  chapter: string
  section: string
  label: string
  content: string
}

export const bookDetails: Record<BookId, { title: string; author: string }> = {
  hartshorne: { title: 'Algebraic Geometry', author: 'Robin Hartshorne' },
  vakil: { title: 'The Rising Sea', author: 'Ravi Vakil' },
}

const exerciseFiles = import.meta.glob<string>('./exercises/**/*.tex', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export const exercises: Exercise[] = Object.entries(exerciseFiles)
  .flatMap(([path, content]) => {
    const match = path.match(/^\.\/exercises\/(hartshorne|vakil)\/([^/]+)\/([^/]+)\/([^/]+)\.tex$/)
    if (!match) return []

    const [, bookId, chapter, section, filename] = match
    const label = bookId === 'hartshorne'
      ? filename.replaceAll('_', '.')
      : filename

    return [{
      id: path,
      bookId: bookId as BookId,
      chapter,
      section,
      label,
      content,
    }]
  })
  .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }))

function chapterOrder(value: string): number {
  if (/^\d+$/.test(value)) return Number(value)

  const romanValues: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }
  const roman = value.toUpperCase()
  let total = 0

  for (let index = 0; index < roman.length; index += 1) {
    const current = romanValues[roman[index]] ?? 0
    const next = romanValues[roman[index + 1]] ?? 0
    total += current < next ? -current : current
  }

  return total
}

export function getBookExercises(bookId: BookId): Exercise[] {
  return exercises.filter((exercise) => exercise.bookId === bookId)
}

export function getBookChapters(bookId: BookId): string[] {
  return [...new Set(getBookExercises(bookId).map((exercise) => exercise.chapter))]
    .sort((left, right) => chapterOrder(left) - chapterOrder(right))
}

export function getChapterSections(bookId: BookId, chapter: string): string[] {
  return [...new Set(
    getBookExercises(bookId)
      .filter((exercise) => exercise.chapter === chapter)
      .map((exercise) => exercise.section),
  )].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
}

export function getSectionExercises(bookId: BookId, chapter: string, section: string): Exercise[] {
  return getBookExercises(bookId)
    .filter((exercise) => exercise.chapter === chapter && exercise.section === section)
    .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }))
}
