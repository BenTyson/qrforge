import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@/components/icons';
import { QR_TYPES } from '@/constants/homepage';

export function QRTypesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            16 QR Types
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            One tool for <span className="gradient-text">every QR code</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From simple URLs to interactive landing pages, create any type of QR
            code you need
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {QR_TYPES.map((type) => (
            <div
              key={type.name}
              className="group p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                {type.icon}
              </div>
              <p className="text-xs font-medium truncate">{type.name}</p>
              {type.pro && <span className="text-[10px] text-primary">Pro</span>}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/signup">
            <Button
              variant="outline"
              className="border-primary/50 hover:bg-primary/10"
            >
              Explore all QR types
              <ArrowRightIcon className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
