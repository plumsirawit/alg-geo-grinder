import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

export type GradeVerdict = 'correct' | 'incorrect'
export type GradingMode = 'mock' | 'ai'

export interface GradeResult {
  verdict: GradeVerdict
  feedback: string
  gradingMode: GradingMode
}

interface GradeExerciseRequest {
  exerciseId: string
}

const gradeExerciseCall = httpsCallable<GradeExerciseRequest, GradeResult>(
  functions,
  'gradeExercise',
  { timeout: 300_000 },
)

export async function gradeExercise(exerciseId: string): Promise<GradeResult> {
  const response = await gradeExerciseCall({ exerciseId })
  return response.data
}
