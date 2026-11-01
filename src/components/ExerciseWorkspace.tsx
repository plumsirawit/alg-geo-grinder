import { LatexText } from './LatexText'
import type { Exercise } from '../exercises'

interface ExerciseWorkspaceProps {
  exercise: Exercise
  answer: string
  onAnswerChange: (answer: string) => void
}

function ExerciseWorkspace({ exercise, answer, onAnswerChange }: ExerciseWorkspaceProps) {
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
          <span className="pane-heading">Your answer <span>Text + $math$</span></span>
          <textarea
            id="latex-answer"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder={'Write your solution here…\n\nUse $...$ for inline math and $$...$$ for display math.\n\nFor example:\nLet $X = \\operatorname{Spec}(A)$. Then:\n$$A \\cong k[x, y]/(y - x^2).$$'}
          />
        </label>
        <section className="preview-pane" aria-label="Rendered answer preview" aria-live="polite">
          <div className="pane-heading">Preview <span>LIVE</span></div>
          {answer.trim()
            ? <div className="latex-answer"><LatexText source={answer} /></div>
            : <p className="preview-placeholder">Your rendered answer will appear here.</p>}
        </section>
      </div>
    </section>
  )
}

export default ExerciseWorkspace
