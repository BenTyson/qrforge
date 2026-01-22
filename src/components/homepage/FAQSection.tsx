import { Card } from '@/components/ui/card';
import { FAQS } from '@/constants/homepage';

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.question} className="p-6 glass">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
