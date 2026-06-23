import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const quizId = searchParams.get('quizId')
    const moduleId = searchParams.get('moduleId')
    const courseId = searchParams.get('courseId')
    const role = searchParams.get('role') || 'student'

    if (quizId) {
      // Get a specific quiz with questions
      const quiz = await db.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: { orderBy: { order: 'asc' } },
          timeExtensions: true,
          module: {
            select: { id: true, title: true, courseId: true },
          },
        },
      })

      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
      }

      // For students, remove correctAnswer from questions
      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map((q) => {
          const { correctAnswer, explanation, ...rest } = q
          if (role === 'student') {
            return rest
          }
          return q
        }),
      }

      return NextResponse.json(sanitizedQuiz)
    }

    if (moduleId) {
      // Get quizzes by module
      const quizzes = await db.quiz.findMany({
        where: { moduleId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
          module: {
            select: { id: true, title: true, courseId: true },
          },
          _count: { select: { questions: true, attempts: true, timeExtensions: true } },
        },
        orderBy: { order: 'asc' },
      })

      // For students, remove correctAnswer
      const sanitizedQuizzes = quizzes.map((quiz) => ({
        ...quiz,
        questions: quiz.questions.map((q) => {
          const { correctAnswer, explanation, ...rest } = q
          if (role === 'student') {
            return rest
          }
          return q
        }),
      }))

      return NextResponse.json(sanitizedQuizzes)
    }

    if (courseId) {
      // Get quizzes by course (through modules)
      const quizzes = await db.quiz.findMany({
        where: {
          module: { courseId },
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
          module: {
            select: { id: true, title: true, courseId: true },
          },
          _count: { select: { questions: true, attempts: true, timeExtensions: true } },
        },
        orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
      })

      // For students, remove correctAnswer
      const sanitizedQuizzes = quizzes.map((quiz) => ({
        ...quiz,
        questions: quiz.questions.map((q) => {
          const { correctAnswer, explanation, ...rest } = q
          if (role === 'student') {
            return rest
          }
          return q
        }),
      }))

      return NextResponse.json(sanitizedQuizzes)
    }

    return NextResponse.json(
      { error: 'quizId, moduleId, or courseId query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      // Create a new quiz with questions
      const { moduleId, title, description, type, isFinalExam, timeLimit, passingScore, maxAttempts, questions } = body

      if (!moduleId || !title) {
        return NextResponse.json({ error: 'moduleId and title are required' }, { status: 400 })
      }

      // Verify module exists and get course info
      const moduleData = await db.module.findUnique({
        where: { id: moduleId },
        include: { course: { select: { id: true, instructor: true } } },
      })

      if (!moduleData) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }

      // Get the next order number
      const existingQuizzes = await db.quiz.findMany({
        where: { moduleId },
        orderBy: { order: 'desc' },
        take: 1,
      })
      const nextOrder = existingQuizzes.length > 0 ? existingQuizzes[0].order + 1 : 0

      const quiz = await db.quiz.create({
        data: {
          moduleId,
          title,
          description: description || null,
          type: type || 'practice',
          isFinalExam: isFinalExam ?? false,
          timeLimit: timeLimit || 30,
          passingScore: passingScore || 70,
          maxAttempts: maxAttempts || 3,
          order: nextOrder,
          questions: questions && questions.length > 0
            ? {
                create: questions.map((q: { text: string; type: string; options: string; correctAnswer: string; explanation?: string; points?: number }, i: number) => ({
                  text: q.text,
                  type: q.type || 'multiple_choice',
                  options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation || null,
                  points: q.points || 1,
                  order: i,
                })),
              }
            : undefined,
        },
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
      })

      return NextResponse.json(quiz, { status: 201 })
    }

    if (action === 'add-question') {
      // Add a question to an existing quiz
      const { quizId, text, type, options, correctAnswer, explanation, points } = body

      if (!quizId || !text || !correctAnswer) {
        return NextResponse.json({ error: 'quizId, text, and correctAnswer are required' }, { status: 400 })
      }

      const existingQuestions = await db.question.findMany({
        where: { quizId },
        orderBy: { order: 'desc' },
        take: 1,
      })
      const nextOrder = existingQuestions.length > 0 ? existingQuestions[0].order + 1 : 0

      const question = await db.question.create({
        data: {
          quizId,
          text,
          type: type || 'multiple_choice',
          options: typeof options === 'string' ? options : JSON.stringify(options),
          correctAnswer,
          explanation: explanation || null,
          points: points || 1,
          order: nextOrder,
        },
      })

      return NextResponse.json(question, { status: 201 })
    }

    if (action === 'delete-question') {
      const { questionId } = body
      if (!questionId) {
        return NextResponse.json({ error: 'questionId is required' }, { status: 400 })
      }
      await db.question.delete({ where: { id: questionId } })
      return NextResponse.json({ success: true })
    }

    if (action === 'update-quiz') {
      const { quizId, title, description, type, isFinalExam, timeLimit, passingScore, maxAttempts } = body
      if (!quizId) {
        return NextResponse.json({ error: 'quizId is required' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (type !== undefined) updateData.type = type
      if (isFinalExam !== undefined) updateData.isFinalExam = isFinalExam
      if (timeLimit !== undefined) updateData.timeLimit = timeLimit
      if (passingScore !== undefined) updateData.passingScore = passingScore
      if (maxAttempts !== undefined) updateData.maxAttempts = maxAttempts

      const quiz = await db.quiz.update({
        where: { id: quizId },
        data: updateData,
        include: { questions: { orderBy: { order: 'asc' } } },
      })

      return NextResponse.json(quiz)
    }

    if (action === 'delete-quiz') {
      const { quizId } = body
      if (!quizId) {
        return NextResponse.json({ error: 'quizId is required' }, { status: 400 })
      }
      await db.quiz.delete({ where: { id: quizId } })
      return NextResponse.json({ success: true })
    }

    if (action === 'extend-time') {
      // Extend time for a student on a quiz
      const { quizId, userId, extensionMinutes, reason, grantedBy } = body

      if (!quizId || !userId || !extensionMinutes || !grantedBy) {
        return NextResponse.json({ error: 'quizId, userId, extensionMinutes, and grantedBy are required' }, { status: 400 })
      }

      const extension = await db.timeExtension.create({
        data: {
          quizId,
          userId,
          extensionMinutes,
          reason: reason || 'Instructor granted extension',
          grantedBy,
        },
      })

      return NextResponse.json(extension, { status: 201 })
    }

    if (action === 'reset-time') {
      // Reset time for a student's quiz attempt (delete in-progress attempt so they can restart)
      const { attemptId, quizId, userId, extensionMinutes, reason, grantedBy } = body

      if (!grantedBy) {
        return NextResponse.json({ error: 'grantedBy is required' }, { status: 400 })
      }

      // If there's an active attempt, delete it so the student can restart
      if (attemptId) {
        const attempt = await db.quizAttempt.findUnique({
          where: { id: attemptId },
        })
        if (attempt && !attempt.completedAt) {
          await db.quizAttempt.delete({ where: { id: attemptId } })
        }
      }

      // Log the time reset as an extension
      if (quizId && userId) {
        await db.timeExtension.create({
          data: {
            quizId,
            userId,
            extensionMinutes: extensionMinutes || 0,
            reason: reason || 'Instructor reset quiz time',
            grantedBy,
          },
        })
      }

      return NextResponse.json({ success: true, message: 'Quiz time has been reset' })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "add-question", "delete-question", "update-quiz", "delete-quiz", "extend-time", or "reset-time"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error with quiz action:', error)
    return NextResponse.json({ error: 'Failed to process quiz action' }, { status: 500 })
  }
}
