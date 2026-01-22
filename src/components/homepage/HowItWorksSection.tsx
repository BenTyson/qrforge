import { CreateIcon, DownloadIcon, ChartIcon, QRCodeIcon, LinkIcon, CheckIcon, ArrowRightIcon } from '@/components/icons';

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Create professional QR codes in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                  1
                </span>
                <CreateIcon />
              </div>
              <h3 className="font-semibold text-lg mb-2">Create</h3>
              <p className="text-sm text-muted-foreground">
                Choose from 16 QR types: URL, WiFi, vCard, Menu, PDF, and more.
                Customize colors and add your logo.
              </p>
            </div>
            {/* Connector line - hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                  2
                </span>
                <DownloadIcon />
              </div>
              <h3 className="font-semibold text-lg mb-2">Download & Share</h3>
              <p className="text-sm text-muted-foreground">
                Export as PNG or SVG. Print on packaging, menus, business cards,
                or share digitally.
              </p>
            </div>
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                  3
                </span>
                <ChartIcon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Track & Update</h3>
              <p className="text-sm text-muted-foreground">
                See who&apos;s scanning, when, and where. Update your destination
                anytime without reprinting.
              </p>
            </div>
          </div>
        </div>

        {/* Visual flow diagram */}
        <div className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background">
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <QRCodeIcon />
              </div>
              <span>Your QR Code</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <LinkIcon />
              </div>
              <span className="text-primary font-medium">QRWolf</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background">
              <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                <CheckIcon className="w-4 h-4" />
              </div>
              <span>Any Destination</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Dynamic QR codes route through QRWolf, so you can change the
            destination anytime
          </p>
        </div>
      </div>
    </section>
  );
}
