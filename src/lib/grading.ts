export function calculateLetterGrade(score: number): string {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 67) return 'D+'
  if (score >= 63) return 'D'
  if (score >= 60) return 'D-'
  return 'F'
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-600'
  if (grade.startsWith('B')) return 'text-blue-600'
  if (grade.startsWith('C')) return 'text-amber-600'
  if (grade.startsWith('D')) return 'text-orange-600'
  return 'text-red-600'
}

export function getGradeBgColor(grade: string): string {
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-700'
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700'
  if (grade.startsWith('C')) return 'bg-amber-100 text-amber-700'
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

export function getGradeLabel(grade: string): string {
  if (grade.startsWith('A')) return 'Distinction'
  if (grade.startsWith('B')) return 'Merit'
  if (grade.startsWith('C')) return 'Pass'
  if (grade.startsWith('D')) return 'Conditional Pass'
  return 'Fail'
}

export const GRADE_SCALE = [
  { grade: 'A+', range: '97-100%', label: 'Distinction' },
  { grade: 'A', range: '93-96%', label: 'Distinction' },
  { grade: 'A-', range: '90-92%', label: 'Distinction' },
  { grade: 'B+', range: '87-89%', label: 'Merit' },
  { grade: 'B', range: '83-86%', label: 'Merit' },
  { grade: 'B-', range: '80-82%', label: 'Merit' },
  { grade: 'C+', range: '77-79%', label: 'Pass' },
  { grade: 'C', range: '73-76%', label: 'Pass' },
  { grade: 'C-', range: '70-72%', label: 'Pass' },
  { grade: 'D+', range: '67-69%', label: 'Conditional Pass' },
  { grade: 'D', range: '63-66%', label: 'Conditional Pass' },
  { grade: 'D-', range: '60-62%', label: 'Conditional Pass' },
  { grade: 'F', range: 'Below 60%', label: 'Fail' },
] as const
