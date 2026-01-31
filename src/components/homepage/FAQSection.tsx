'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { FAQS, FAQ_CATEGORIES, FAQCategory } from '@/constants/homepage';

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>(
    'all'
  );

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQS
      : FAQS.filter((faq) => faq.category === activeCategory);

  return (
    <section id="faq" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about QRWolf
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            All Questions
          </button>
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion FAQ list */}
        <Accordion type="multiple" className="space-y-3">
          {filteredFaqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center glass rounded-xl p-8">
          <p className="text-lg font-semibold mb-2">Still have questions?</p>
          <p className="text-sm text-muted-foreground mb-4">
            We&apos;re here to help. Reach out and we&apos;ll get back to you as
            soon as possible.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
