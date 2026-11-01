import { useMemo } from 'react'
import katex from 'katex'
import { LatexText } from './LatexText'
import type { Exercise } from '../exercises'

interface ExerciseWorkspaceProps {
  exercise: Exercise
  answer: string
  onAnswerChange: (answer: string) => void
}

function ExerciseWorkspace({ exercise, answer, onAnswerChange }: ExerciseWorkspaceProps) {
  const renderedAnswer = useMemo(() => {
    if (!answer.trim()) return ''

    return katex.renderToString(answer, {
      displayMode: true,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
    })
  }, [answer])

  return (
    <section className="exercise-workspace" aria-labelledby="exercise-heading">
      <div className="exercise-prompt">
        <p className="exercise-kicker">
          Chapter {exercise.chapter} · Section {exercise.section} · Exercise {exercise.label}
        </p>
        <h2 id="exercise-heading">Exercise {exercise.label}</h2>
        {exercise.content.trim().split(/\n\s*\n/).map((paragraph, index) => (
          <p className="exercise-statement" key={`${exercise.id}-${index}`}>
            <LatexText source={paragraph.trim()} />
          </p>
        ))}
      </div>

      <div className="answer-workspace">
        <label className="answer-pane" htmlFor="latex-answer">
          <span className="pane-heading">Your answer <span>LaTeX</span></span>
          <textarea
            id="latex-answer"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder={'Write your solution in LaTeX…\n\nFor example:\n\\text{Let } X = \\operatorname{Spec}(A).'}
          />
        </label>
        <section className="preview-pane" aria-label="Rendered answer preview" aria-live="polite">
          <div className="pane-heading">Preview <span>LIVE</span></div>
          {renderedAnswer
            ? <div className="latex-answer" dangerouslySetInnerHTML={{ __html: renderedAnswer }} />
            : <p className="preview-placeholder">Your rendered answer will appear here.</p>}
        </section>
      </div>
    </section>
  )
}

export default ExerciseWorkspace
