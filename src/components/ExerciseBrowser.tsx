import { useState } from 'react'
import {
  getBookChapters,
  getChapterSections,
  getSectionExercises,
  type BookId,
  type Exercise,
} from '../exercises'

interface ExerciseBrowserProps {
  bookId: BookId
  selectedExerciseId: string | null
  onSelectExercise: (exercise: Exercise | null) => void
}

function ExerciseBrowser({
  bookId,
  selectedExerciseId,
  onSelectExercise,
}: ExerciseBrowserProps) {
  const chapters = getBookChapters(bookId)
  const [chapter, setChapter] = useState(chapters[0] ?? '')
  const sections = getChapterSections(bookId, chapter)
  const [section, setSection] = useState(sections[0] ?? '')
  const sectionExercises = getSectionExercises(bookId, chapter, section)

  function changeChapter(nextChapter: string) {
    setChapter(nextChapter)
    setSection(getChapterSections(bookId, nextChapter)[0] ?? '')
    onSelectExercise(null)
  }

  function changeSection(nextSection: string) {
    setSection(nextSection)
    onSelectExercise(null)
  }

  function changeExercise(id: string) {
    onSelectExercise(sectionExercises.find((exercise) => exercise.id === id) ?? null)
  }

  return (
    <div className="exercise-browser" aria-label="Browse exercises">
      <label>
        <span>Chapter</span>
        <select value={chapter} onChange={(event) => changeChapter(event.target.value)}>
          {chapters.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>Section</span>
        <select
          value={section}
          onChange={(event) => changeSection(event.target.value)}
          disabled={sections.length === 0}
        >
          {sections.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>Exercise</span>
        <select
          value={selectedExerciseId ?? ''}
          onChange={(event) => changeExercise(event.target.value)}
          disabled={sectionExercises.length === 0}
        >
          <option value="">Choose an exercise</option>
          {sectionExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>{exercise.label}</option>
          ))}
        </select>
      </label>
      {sectionExercises.length === 0 && (
        <p className="exercise-empty">No exercises have been added to this section yet.</p>
      )}
    </div>
  )
}

export default ExerciseBrowser
