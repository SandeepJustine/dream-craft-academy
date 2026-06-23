'use client'

import { useAppStore, type Page } from '@/lib/store'
import { Cross, Facebook, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', page: 'home' as Page },
      { label: 'Courses', page: 'courses' as Page },
      { label: 'About Us', page: 'about' as Page },
      { label: 'Apply Now', page: 'apply' as Page },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Our Doctrine', page: 'doctrine' as Page },
      { label: 'Student Dashboard', page: 'dashboard' as Page },
      { label: 'Course Catalog', page: 'courses' as Page },
      { label: 'Admissions', page: 'apply' as Page },
    ],
  },
]

export function Footer() {
  const { navigate } = useAppStore()

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/main-logo.png" alt="DreamCraft Christian Institute" className="h-9 w-9 rounded-lg object-cover" />
              <div className="flex flex-col">
                <span className="text-base font-bold text-white leading-tight">
                  DreamCraft
                </span>
                <span className="text-[10px] font-medium text-stone-400 leading-tight tracking-wider uppercase">
                  Christian Institute
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-4">
              Free, accessible online Christian education and training, nurturing believers to grow in skill, deepen in faith, and amplify their influence.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/61581280748513"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800 dark:bg-stone-800 hover:bg-amber-600 transition-colors text-stone-400 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="mailto:info@dreamcraftinstitute.org"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800 dark:bg-stone-800 hover:bg-amber-600 transition-colors text-stone-400 hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.page)}
                      className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-stone-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>Malawi, Africa</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-stone-400">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>info@dreamcraftinstitute.org</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-stone-400">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>24/7 Support Available</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} DreamCraft Christian Institute. All rights reserved.
            </p>
            <p className="text-xs text-stone-500">
              Free Christian Education for All · Equipping Believers Worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
