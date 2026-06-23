'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Are the courses really free?',
    answer:
      'Yes, 100% free! Every course at DreamCraft Christian Institute is completely free of charge — no tuition, no hidden fees, and no scholarships needed. We believe that faith-based education should be accessible to everyone, everywhere.',
  },
  {
    question: 'Who can enroll?',
    answer:
      'Anyone seeking faith-based education is welcome! Our doors are open to people of all backgrounds, denominations, and walks of life. Whether you are a new believer, a seasoned ministry leader, or simply curious about Christian education, you belong here.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Getting started is simple: create a free account, browse our course catalog, and enroll in any course that interests you. There are no entrance exams or prerequisites for most courses — just sign up and begin learning at your own pace.',
  },
  {
    question: 'What support is available?',
    answer:
      'We offer 24/7 support via email, WhatsApp, or live chat. Our dedicated team is always ready to help with technical issues, course questions, or any other needs. You are never alone on your learning journey.',
  },
  {
    question: 'Do I receive a certificate upon completion?',
    answer:
      'Yes! Upon successfully completing a course and submitting your feedback, you will receive a downloadable Certificate of Completion. This certificate recognizes your achievement and can be used to demonstrate your commitment to personal and spiritual growth.',
  },
  {
    question: 'Can I study at my own pace?',
    answer:
      'Absolutely! All our courses are designed for flexible, self-paced learning. There are no rigid deadlines or schedules — you can study whenever and wherever it suits you. Pause, resume, and revisit lessons as often as you need.',
  },
  {
    question: 'What types of courses are offered?',
    answer:
      'We offer courses across four key areas: Life Coaching, Leadership, Ministry, and Management. Each course ranges from Beginner to Advanced levels and includes video lessons, reading materials, quizzes, assignments, and interactive forums to enrich your learning experience.',
  },
]

export function FAQ() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <HelpCircle className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about DreamCraft Christian Institute. Can&apos;t find the answer you&apos;re looking for? Reach out to our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/50"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline hover:text-primary py-5 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
