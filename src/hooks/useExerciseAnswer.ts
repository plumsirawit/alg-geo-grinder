import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Exercise } from '../exercises'
import type { GradeResult } from '../services/gradeExercise'

type LoadStatus = 'loading' | 'ready' | 'error'
type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface Conflict {
  localAnswer: string
  remoteAnswer: string
}

type SaveResult =
  | { kind: 'saved' }
  | { kind: 'conflict'; remoteAnswer: string }

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

function makeAnswerReference(uid: string, exercise: Exercise): DocumentReference {
  const exerciseDocumentId = encodeURIComponent(
    exercise.id.replace(/^\.\/exercises\//, ''),
  )

  return doc(db, 'users', uid, 'exercises', exerciseDocumentId)
}

async function compareAndSetAnswer(
  reference: DocumentReference,
  expectedAnswer: string,
  nextAnswer: string,
): Promise<SaveResult> {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference)

    if (!snapshot.exists()) {
      return { kind: 'conflict', remoteAnswer: '' }
    }

    const storedAnswer: unknown = snapshot.data().answer
    if (typeof storedAnswer !== 'string') {
      throw new Error('The saved exercise answer has an invalid format.')
    }

    if (storedAnswer !== expectedAnswer) {
      return { kind: 'conflict', remoteAnswer: storedAnswer }
    }

    if (storedAnswer !== nextAnswer) {
      transaction.update(reference, {
        answer: nextAnswer,
        updatedAt: serverTimestamp(),
      })
    }

    return { kind: 'saved' }
  })
}

export function useExerciseAnswer(uid: string, exercise: Exercise) {
  const reference = useMemo(
    () => makeAnswerReference(uid, exercise),
    [uid, exercise],
  )
  const [answer, setAnswer] = useState('')
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [loadError, setLoadError] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [saveAttempt, setSaveAttempt] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const initialReferenceAnswer = useRef('')
  const currentAnswer = useRef('')
  const isSaving = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function loadAnswer() {
      try {
        const fetchedData = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(reference)
          if (snapshot.exists()) {
            const storedAnswer: unknown = snapshot.data().answer
            if (typeof storedAnswer !== 'string') {
              throw new Error('The saved exercise answer has an invalid format.')
            }
            const data = snapshot.data()
            const verdict = data.lastVerdict
            const gradingMode = data.gradingMode
            const feedback = data.lastFeedback
            const storedGradeResult: GradeResult | null =
              (verdict === 'correct' || verdict === 'incorrect')
              && (gradingMode === 'mock' || gradingMode === 'ai')
              && typeof feedback === 'string'
              && data.solved === (verdict === 'correct')
                ? { verdict, gradingMode, feedback }
                : null
            return { answer: storedAnswer, gradeResult: storedGradeResult }
          }

          transaction.set(reference, {
            answer: '',
            bookId: exercise.bookId,
            chapter: exercise.chapter,
            section: exercise.section,
            exerciseLabel: exercise.label,
            updatedAt: serverTimestamp(),
          })
          return { answer: '', gradeResult: null }
        })

        if (cancelled) return
        initialReferenceAnswer.current = fetchedData.answer
        currentAnswer.current = fetchedData.answer
        setAnswer(fetchedData.answer)
        setGradeResult(fetchedData.gradeResult)
        setLoadStatus('ready')
        setSaveStatus('saved')
      } catch (error) {
        console.error('Unable to load exercise answer:', error)
        if (cancelled) return
        setLoadError(getErrorMessage(error))
        setLoadStatus('error')
      }
    }

    void loadAnswer()

    return () => {
      cancelled = true
    }
  }, [exercise.bookId, exercise.chapter, exercise.label, exercise.section, loadAttempt, reference])

  const updateAnswer = useCallback((nextAnswer: string) => {
    currentAnswer.current = nextAnswer
    setAnswer(nextAnswer)
    setGradeResult(null)
    setIsDirty(true)
    setSaveError('')
    setSaveStatus('pending')
  }, [])

  const updateGradeResult = useCallback((result: GradeResult) => {
    setGradeResult(result)
  }, [])

  useEffect(() => {
    if (
      loadStatus !== 'ready'
      || !isDirty
      || conflict
      || saveStatus === 'error'
      || saveStatus === 'saving'
    ) {
      return
    }

    const draft = answer
    const expectedAnswer = initialReferenceAnswer.current
    const timeout = window.setTimeout(async () => {
      if (isSaving.current) return
      isSaving.current = true
      setSaveStatus('saving')
      setSaveError('')

      try {
        const result = await compareAndSetAnswer(
          reference,
          expectedAnswer,
          draft,
        )

        if (result.kind === 'conflict') {
          setConflict({ localAnswer: draft, remoteAnswer: result.remoteAnswer })
          setSaveStatus('idle')
          return
        }

        initialReferenceAnswer.current = draft
        if (currentAnswer.current === draft) {
          setIsDirty(false)
          setSaveStatus('saved')
        } else {
          setSaveStatus('pending')
          setSaveAttempt((attempt) => attempt + 1)
        }
      } catch (error) {
        console.error('Unable to save exercise answer:', error)
        setSaveError(getErrorMessage(error))
        setSaveStatus('error')
      } finally {
        isSaving.current = false
      }
    }, 3000)

    return () => window.clearTimeout(timeout)
  }, [answer, conflict, isDirty, loadStatus, reference, saveAttempt, saveStatus])

  const retryLoad = useCallback(() => {
    setLoadError('')
    setLoadStatus('loading')
    setSaveStatus('idle')
    setLoadAttempt((attempt) => attempt + 1)
  }, [])

  const retrySave = useCallback(() => {
    setSaveError('')
    setSaveStatus('pending')
    setSaveAttempt((attempt) => attempt + 1)
  }, [])

  const useRemoteAnswer = useCallback(() => {
    if (!conflict) return

    initialReferenceAnswer.current = conflict.remoteAnswer
    currentAnswer.current = conflict.remoteAnswer
    setAnswer(conflict.remoteAnswer)
    setIsDirty(false)
    setConflict(null)
    setSaveError('')
    setSaveStatus('saved')
  }, [conflict])

  const keepLocalAnswer = useCallback(async () => {
    if (!conflict || isSaving.current) return

    isSaving.current = true
    setSaveStatus('saving')
    setSaveError('')

    try {
      const result = await compareAndSetAnswer(
        reference,
        conflict.remoteAnswer,
        conflict.localAnswer,
      )

      if (result.kind === 'conflict') {
        setConflict({
          localAnswer: conflict.localAnswer,
          remoteAnswer: result.remoteAnswer,
        })
        setSaveStatus('idle')
        return
      }

      initialReferenceAnswer.current = conflict.localAnswer
      currentAnswer.current = conflict.localAnswer
      setAnswer(conflict.localAnswer)
      setIsDirty(false)
      setConflict(null)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Unable to resolve exercise answer conflict:', error)
      setSaveError(getErrorMessage(error))
      setSaveStatus('error')
    } finally {
      isSaving.current = false
    }
  }, [conflict, reference])

  return {
    answer,
    conflict,
    gradeResult,
    isDisabled: loadStatus !== 'ready' || conflict !== null,
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
  }
}
