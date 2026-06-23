'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Grace M.',
    role: 'Christian Leadership Student',
    location: 'Malawi',
    text: 'DreamCraft Institute has transformed my understanding of leadership. The courses are deeply rooted in Scripture and practically applicable. I now lead my youth group with confidence and purpose.',
    rating: 5,
  },
  {
    name: 'John K.',
    role: 'Biblical Foundations Student',
    location: 'Zambia',
    text: 'I never thought I could access such quality Christian education for free. The Biblical Foundations course gave me a comprehensive understanding of God\'s Word that I carry into every area of my life.',
    rating: 5,
  },
  {
    name: 'Esther N.',
    role: 'Ministry & Practice Student',
    location: 'Kenya',
    text: 'The Introduction to Management course equipped me with practical skills I use daily in my ministry. The biblical integration makes all the difference — it\'s not just theory, it\'s transformation.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-amber-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of believers who are growing in faith and purpose through DreamCraft.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="card-hover rounded-2xl bg-white border border-border/50 p-6 shadow-sm"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role} · {testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
