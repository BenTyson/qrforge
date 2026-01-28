'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './ui';
import { QuoteIcon } from '@/components/icons';
import { TESTIMONIALS } from '@/constants/homepage';

const CARDS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(TESTIMONIALS.length / CARDS_PER_PAGE);
const AUTO_ADVANCE_MS = 6000;

export function TestimonialsSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % TOTAL_PAGES);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextPage, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isPaused, nextPage]);

  const visibleTestimonials = TESTIMONIALS.slice(
    currentPage * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Trusted by{' '}
            <span className="gradient-text">businesses everywhere</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of businesses using QRWolf to connect with customers
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {visibleTestimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 glass relative">
              <QuoteIcon className="absolute top-4 right-4" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <StarRating />

              <Badge className="mt-4 bg-secondary text-muted-foreground text-xs">
                {testimonial.industry}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Page indicators */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              aria-label={`Show testimonials page ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <p className="font-semibold">Privacy-First</p>
              <p className="text-xs text-muted-foreground">GDPR compliant</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p className="font-semibold">99.9% Uptime</p>
              <p className="text-xs text-muted-foreground">Enterprise-grade reliability</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="font-semibold">10,000+ Users</p>
              <p className="text-xs text-muted-foreground">Trusted worldwide</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="font-semibold">4.9/5 Rating</p>
              <p className="text-xs text-muted-foreground">Based on user reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
