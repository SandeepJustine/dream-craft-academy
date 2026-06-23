import { db } from '@/lib/db'

interface CreateNotificationParams {
  userId: string
  type: 'enrollment' | 'completion' | 'message' | 'general'
  title: string
  message: string
  courseId?: string
  link?: string
  // Email-specific fields (logged to console in demo)
  email?: string
  studentName?: string
  courseName?: string
  instructorName?: string
}

export async function createNotification(params: CreateNotificationParams) {
  // Create in-app notification
  const notification = await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      courseId: params.courseId,
      link: params.link,
    },
  })

  // Log email notification (in production, this would send actual emails)
  console.log(`📧 EMAIL NOTIFICATION [${params.type}]`)
  console.log(`   To: ${params.email || params.userId}`)
  console.log(`   Subject: ${params.title}`)
  console.log(`   Body: ${params.message}`)
  console.log(`   ---`)

  return notification
}

export async function notifyEnrollment(
  userId: string,
  courseId: string,
  courseName: string,
  studentName: string,
  studentEmail: string
) {
  return createNotification({
    userId,
    type: 'enrollment',
    title: `Welcome to ${courseName}!`,
    message: `Dear ${studentName}, welcome to ${courseName} at DreamCraft Christian Institute! We're excited to have you on this learning journey. You now have access to all course materials, quizzes, and assignments. May God bless your studies!`,
    courseId,
    link: `/courses`,
    email: studentEmail,
    studentName,
    courseName,
  })
}

export async function notifyCompletion(
  userId: string,
  courseId: string,
  courseName: string,
  studentName: string,
  studentEmail: string,
  grade: string
) {
  return createNotification({
    userId,
    type: 'completion',
    title: `Congratulations! You completed ${courseName}!`,
    message: `Dear ${studentName}, congratulations on completing ${courseName} with a grade of ${grade}! Your certificate of completion is now available. We encourage you to submit your feedback about the course. May God continue to bless your journey of learning!`,
    courseId,
    link: `/certificates`,
    email: studentEmail,
    studentName,
    courseName,
  })
}

export async function notifyNewMessage(
  userId: string,
  courseId: string,
  courseName: string,
  studentName: string,
  studentEmail: string,
  instructorName: string
) {
  return createNotification({
    userId,
    type: 'message',
    title: `New message from ${instructorName}`,
    message: `Dear ${studentName}, your instructor ${instructorName} has sent you a new message in ${courseName}. Please check your messages to stay updated.`,
    courseId,
    link: `/chat`,
    email: studentEmail,
    studentName,
    courseName,
    instructorName,
  })
}
