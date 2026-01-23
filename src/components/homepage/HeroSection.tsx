import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative hero-mast pt-16 min-h-[400px] sm:min-h-[480px] md:min-h-[560px] flex items-center justify-center overflow-hidden">
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      {/* Subtle animated glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Logo with glow */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <Image
          src="/QRWolf_Logo_Particle_Color.png"
          alt="QRWolf Logo"
          width={180}
          height={190}
          className="logo-glow mb-4 drop-shadow-2xl"
          priority
        />
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          QR codes with <span className="gradient-text">teeth</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-2">
          Create once. Update anytime. Track everything.
        </p>
        <p className="text-sm md:text-base text-white/50 max-w-lg">
          No reprinting. No broken links. No guessing who scanned.
        </p>
      </div>
    </section>
  );
}
