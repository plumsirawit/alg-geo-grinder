import { useState } from 'react'
import { LatexText } from './LatexText'
import { useExerciseAnswer } from '../hooks/useExerciseAnswer'
import { gradeExercise } from '../services/gradeExercise'
import type { Exercise } from '../exercises'

interface ExerciseWorkspaceProps {
  userId: string
  exercise: Exercise
}

function ExerciseWorkspace({ userId, exercise }: ExerciseWorkspaceProps) {
  const {
    answer,
    conflict,
    gradeResult,
    isDisabled,
    loadError,
    loadStatus,
    retryLoad,
    retrySave,
    saveError,
    saveStatus,
    updateAnswer,
    updateGradeResult,
    useRemoteAnswer,
    keepLocalAnswer,
  } = useExerciseAnswer(userId, exercise)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const canSubmit = loadStatus === 'ready'
    && saveStatus === 'saved'
    && answer.trim().length > 0
    && conflict === null
    && !isSubmitting

  function handleAnswerChange(nextAnswer: string) {
    updateAnswer(nextAnswer)
    setSubmitError('')
  }

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const exerciseId = exercise.id.replace(/^\.\/exercises\//, '')
      const result = await gradeExercise(exerciseId)
      updateGradeResult(result)
    } catch (error) {
      console.error('Unable to submit exercise answer:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'An unexpected error occurred.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="exercise-workspace" aria-labelledby="exercise-heading">
      <div
        className={`exercise-prompt${gradeResult
          ? ` exercise-prompt-${gradeResult.verdict}`
          : ''}`}
      >
        <p className="exercise-kicker">
          Chapter {exercise.chapter} · Section {exercise.section} · Exercise {exercise.label}
        </p>
        <h2 id="exercise-heading">Exercise {exercise.label}</h2>
        {exercise.content.trim().split(/\n\s*\n/).map((paragraph, index) => (
          <p className="exercise-statement" key={`${exercise.id}-${index}`}>
            <LatexText source={paragraph.trim()} />
          </p>
        ))}
        {exercise.bookId === 'vakil' ? (
          <p className="exercise-source">
            Source: Ravi Vakil, <cite>The Rising Sea: Foundations of Algebraic Geometry</cite>,
            {' '}Exercise {exercise.chapter}.{exercise.section}.{exercise.label};
            {' '}<a href="https://virtualmath1.stanford.edu/~vakil/216blog/" rel="noreferrer" target="_blank">
              October 21, 2025 notes
            </a>.
            {' '}The exercise text is reproduced without modification for noncommercial use
            under the{' '}
            <a href="https://creativecommons.org/licenses/by-nc-nd/3.0/" rel="noreferrer" target="_blank">
              CC BY-NC-ND 3.0 License
            </a>.
          </p>
        ) : (
          <p className="exercise-source">
            Source: Robin Hartshorne, <cite>Algebraic Geometry</cite>, Chapter {exercise.chapter},
            {' '}§{exercise.section}, Exercise {exercise.label}. This noncommercial educational
            project reproduces selected exercise statements only, not the book&apos;s explanatory
            text, and displays the statements without modification.
          </p>
        )}
      </div>

      <div className="answer-workspace">
        <div className="answer-pane">
          <label className="pane-heading" htmlFor="latex-answer">
            Your answer <span>Text + $math$</span>
          </label>
          <textarea
            id="latex-answer"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={answer}
            onChange={(event) => handleAnswerChange(event.target.value)}
            disabled={isDisabled || isSubmitting}
            placeholder={'Write your solution here…\n\nUse $...$ for inline math and $$...$$ for display math.\n\nFor example:\nLet $X = \\operatorname{Spec}(A)$. Then:\n$$A \\cong k[x, y]/(y - x^2).$$'}
          />
          <div className="answer-status" role="status" aria-live="polite">
            {loadStatus === 'loading' && 'Loading your saved answer…'}
            {loadStatus === 'error' && (
              <>
                <span>Could not load your answer: {loadError}</span>
                <button className="link-button" type="button" onClick={retryLoad}>Try again</button>
              </>
            )}
            {loadStatus === 'ready' && saveStatus === 'saved' && 'All changes saved.'}
            {loadStatus === 'ready' && saveStatus === 'pending' && 'Changes will save after you pause for 3 seconds.'}
            {loadStatus === 'ready' && saveStatus === 'saving' && 'Saving your answer…'}
            {loadStatus === 'ready' && saveStatus === 'error' && (
              <>
                <span>Could not save your answer: {saveError}</span>
                <button className="link-button" type="button" onClick={retrySave}>Retry save</button>
              </>
            )}
          </div>
        </div>
        <section className="preview-pane" aria-label="Rendered answer preview" aria-live="polite">
          <div className="pane-heading">Preview <span>LIVE</span></div>
          {answer.trim()
            ? <div className="latex-answer"><LatexText source={answer} /></div>
            : <p className="preview-placeholder">Your rendered answer will appear here.</p>}
        </section>
      </div>
      <div className="grading-panel">
        <div className="grading-controls">
          <button
            className="primary-button"
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Submitting…' : 'Submit for grading'}
          </button>
          <p className="grading-status" role="status" aria-live="polite">
            {loadStatus === 'loading' && 'Load your saved answer before submitting.'}
            {loadStatus === 'ready' && saveStatus === 'pending' && 'Wait for your answer to save before submitting.'}
            {loadStatus === 'ready' && saveStatus === 'saving' && 'Your answer is saving; submission is unavailable.'}
            {loadStatus === 'ready' && saveStatus === 'error' && 'Resolve the save error before submitting.'}
            {loadStatus === 'ready' && saveStatus === 'saved' && !answer.trim() && 'Write an answer before submitting.'}
            {isSubmitting && 'The grader is checking the saved answer.'}
          </p>
        </div>
        <p className="grading-disclosure">
          Submitting sends this exercise statement and your saved answer to
          OpenAI for AI grading. The result may be mistaken.
        </p>
        {submitError && <p className="notice-error" role="alert">{submitError}</p>}
        {gradeResult && (
          <section
            className={`grading-result grading-result-${gradeResult.verdict}`}
            aria-live="polite"
            aria-label="Grading result"
          >
            <h3>
              {gradeResult.gradingMode === 'mock' ? 'Mock grader result' : 'AI grader result'}
              {' — '}
              {gradeResult.verdict === 'correct' ? 'Correct' : 'Incorrect'}
            </h3>
            <p>{gradeResult.feedback}</p>
          </section>
        )}
      </div>
      {conflict && (
        <div className="conflict-backdrop">
          <section
            className="conflict-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="conflict-heading"
            aria-describedby="conflict-description"
          >
            <h2 id="conflict-heading">This answer changed elsewhere</h2>
            <p id="conflict-description">
              Another session saved a different answer while you were working.
              Choose which version to keep.
            </p>
            <div className="conflict-versions">
              <div>
                <h3>Saved in Firestore</h3>
                <pre>{conflict.remoteAnswer || '(empty answer)'}</pre>
              </div>
              <div>
                <h3>Your current version</h3>
                <pre>{conflict.localAnswer || '(empty answer)'}</pre>
              </div>
            </div>
            {saveError && <p className="notice-error" role="alert">Could not resolve conflict: {saveError}</p>}
            <div className="conflict-actions">
              <button
                className="primary-button"
                type="button"
                onClick={useRemoteAnswer}
                disabled={saveStatus === 'saving'}
              >
                Use saved version
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => void keepLocalAnswer()}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving…' : 'Keep my version'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default ExerciseWorkspace
