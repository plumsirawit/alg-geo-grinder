import katex from 'katex'

interface LatexTextProps {
  source: string
  displayMode?: boolean
}

function renderMath(expression: string, displayMode: boolean) {
  return katex.renderToString(expression, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
    output: 'html',
  })
}

export function LatexText({ source, displayMode = false }: LatexTextProps) {
  const mathPattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$)/g
  const parts = source.split(mathPattern)

  return (
    <>
      {parts.map((part, index) => {
        const isMath = mathPattern.test(part)
        mathPattern.lastIndex = 0

        if (!isMath) {
          return <span key={index}>{part.replace(/^\*\(/, '(')}</span>
        }

        const isDisplay = part.startsWith('$$') || part.startsWith('\\[')
        const expression = isDisplay
          ? part.slice(2, -2)
          : part.startsWith('\\(')
            ? part.slice(2, -2)
            : part.slice(1, -1)

        return (
          <span
            className={isDisplay ? 'exercise-display-math' : undefined}
            key={index}
            dangerouslySetInnerHTML={{ __html: renderMath(expression, isDisplay || displayMode) }}
          />
        )
      })}
    </>
  )
}
