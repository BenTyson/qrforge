import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './ui';
import { QuoteIcon } from '@/components/icons';
import { TESTIMONIALS } from '@/constants/homepage';

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Trusted by{' '}
            <span className="gradient-text">businesses everywhere</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See what our users have to say about QRWolf
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <Card key={index} className="p-6 glass relative">
              {/* Quote mark */}
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

              <p className="text-sm text-muted-foreground mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <StarRating />

              <Badge className="mt-4 bg-secondary text-muted-foreground text-xs">
                {testimonial.industry}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
