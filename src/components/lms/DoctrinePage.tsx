'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Cross,
  BookOpen,
  Shield,
  Heart,
  Globe,
  ArrowRight,
} from 'lucide-react'

const doctrines = [
  {
    title: 'The Holy Scriptures',
    description: 'We believe the Bible is the inspired, infallible, and authoritative Word of God. It is without error in all it affirms and is the supreme and final authority in all matters of faith and conduct.',
    references: '2 Timothy 3:16-17, 2 Peter 1:20-21, Psalm 119:105',
  },
  {
    title: 'The Trinity',
    description: 'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit. These three are co-equal and co-eternal, one in nature, power, and glory.',
    references: 'Matthew 28:19, 2 Corinthians 13:14, Deuteronomy 6:4',
  },
  {
    title: 'The Deity of Christ',
    description: 'We believe in the deity of the Lord Jesus Christ—His virgin birth, His sinless life, His miracles, His atoning death on the cross, His bodily resurrection, His ascension to the right hand of the Father, and His personal return in power and glory.',
    references: 'John 1:1-2,14, Isaiah 7:14, Hebrews 4:15, Acts 1:11',
  },
  {
    title: 'Salvation by Grace',
    description: 'We believe that salvation is a gift of God received by faith alone in Christ alone. It is not earned by good works but is given by God\'s grace to all who repent and believe in Jesus Christ as Lord and Savior.',
    references: 'Ephesians 2:8-9, Romans 10:9-10, John 3:16, Titus 3:5',
  },
  {
    title: 'The Holy Spirit',
    description: 'We believe in the present ministry of the Holy Spirit, by whose indwelling the Christian is enabled to live a godly life. We believe in the baptism of the Holy Spirit, the gifts of the Spirit, and the fruit of the Spirit as outlined in Scripture.',
    references: 'John 14:16-17, Galatians 5:22-23, 1 Corinthians 12:4-11, Acts 1:8',
  },
  {
    title: 'The Church',
    description: 'We believe in the universal Church, the living spiritual body of Christ, of which Christ is the Head and all regenerated persons are members. We believe in the local church as a community of believers united for worship, fellowship, and mission.',
    references: 'Ephesians 1:22-23, Acts 2:42, Hebrews 10:24-25',
  },
  {
    title: 'The Great Commission',
    description: 'We believe that Christ has commissioned His Church to go into all the world and make disciples of all nations, baptizing them and teaching them to obey everything He has commanded.',
    references: 'Matthew 28:18-20, Mark 16:15, Acts 1:8',
  },
  {
    title: 'The Return of Christ',
    description: 'We believe in the personal, visible, and glorious return of the Lord Jesus Christ. We believe in the resurrection of both the saved and the lost—the saved to eternal life and the lost to eternal separation from God.',
    references: '1 Thessalonians 4:16-17, Revelation 20:11-15, John 5:28-29',
  },
]

export function DoctrinePage() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Cross className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Doctrine
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The foundational beliefs that guide DreamCraft Christian Institute, rooted in the eternal truth of God&apos;s Word.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Statement */}
          <Card className="border-border/50 shadow-md mb-10 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 via-primary to-emerald-500" />
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Statement of Faith</h2>
              <p className="text-foreground/80 leading-relaxed">
                DreamCraft Christian Institute is founded upon the truth that the Bible is the inspired, infallible, and authoritative Word of God. All our courses, programs, and activities are grounded in the historic Christian faith as expressed in the Scriptures and summarized in the doctrines below. We hold these beliefs with conviction and grace, seeking always to honor God in truth and love.
              </p>
            </CardContent>
          </Card>

          {/* Doctrines */}
          <div className="space-y-4">
            {doctrines.map((doctrine, index) => (
              <Card key={doctrine.title} className="border-border/50 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{doctrine.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">{doctrine.description}</p>
                      <p className="text-xs text-primary/70 font-medium">
                        Scripture References: {doctrine.references}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Grow in God&apos;s Word?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore our biblically grounded courses and deepen your understanding of the faith.
            </p>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Courses
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
