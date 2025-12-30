'use client';

import type { MP3Content } from '@/lib/qr/types';

interface AudioPreviewProps {
  content: Partial<MP3Content>;
  className?: string;
}

export function AudioPreview({ content, className }: AudioPreviewProps) {
  const title = content.title || 'My Track';
  const artist = content.artist || 'Artist';
  const hasAudio = !!(content.audioUrl || content.embedUrl);
  const isSpotify = content.embedUrl?.includes('spotify');
  const isSoundCloud = content.embedUrl?.includes('soundcloud');
  const hasCover = !!content.coverImage;
  const accentColor = '#14b8a6';

  return (
    <div className={className}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top, #1db95420 0%, transparent 50%),
                         radial-gradient(ellipse at bottom, #f9731620 0%, transparent 50%),
                         linear-gradient(to bottom, #0f172a, #1e293b)`,
          }}
        >
          {/* Floating decorations */}
          <div className="absolute top-10 right-8 w-32 h-32 rounded-full blur-3xl opacity-15 bg-green-500" />
          <div className="absolute bottom-20 left-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-orange-500" />

          {/* Content */}
          <div className="relative h-full px-4 py-6 flex flex-col items-center overflow-y-auto">
            {/* Album Art */}
            <div
              className="relative w-44 h-44 mt-4 mb-6 rounded-2xl overflow-hidden animate-fade-in"
              style={{
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              }}
            >
              {hasCover ? (
                <img
                  src={content.coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                  }}
                >
                  <svg className="w-16 h-16 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              )}
              {/* Vinyl ring effect for album art */}
              <div className="absolute inset-0 border-4 border-white/10 rounded-2xl pointer-events-none" />
            </div>

            {/* Title & Artist */}
            <div
              className="text-center mb-6 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
              <p className="text-sm text-slate-400">{artist}</p>
            </div>

            {/* Platform badge */}
            {(isSpotify || isSoundCloud) && (
              <div
                className="mb-4 animate-slide-up"
                style={{ animationDelay: '150ms' }}
              >
                {isSpotify && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="text-xs text-green-400">Spotify</span>
                  </div>
                )}
                {isSoundCloud && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.054-.05-.1-.084-.1zm-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.19-1.334c-.01-.057-.049-.094-.078-.094zm1.83-.911c-.073 0-.127.058-.133.135l-.195 2.178.195 2.082c.006.077.06.132.133.132s.126-.055.132-.132l.226-2.082-.226-2.178c-.006-.077-.059-.135-.132-.135zm.956-.124c-.089 0-.153.071-.159.16l-.163 2.302.163 2.075c.006.088.07.158.159.158s.152-.07.16-.158l.188-2.075-.188-2.302c-.008-.089-.071-.16-.16-.16zm1.903.015c-.095 0-.167.081-.171.176l-.133 2.127.133 2.05c.004.095.076.174.171.174.095 0 .167-.079.174-.174l.148-2.05-.148-2.127c-.007-.095-.079-.176-.174-.176zm1.025-.088c-.109 0-.19.094-.193.205l-.11 2.17.11 2.022c.003.111.084.204.193.204s.189-.093.195-.204l.12-2.022-.12-2.17c-.006-.111-.086-.205-.195-.205zm1.015-.17c-.121 0-.217.108-.221.232l-.088 2.317.088 1.993c.004.125.1.231.221.231.121 0 .217-.106.223-.231l.098-1.993-.098-2.317c-.006-.124-.102-.232-.223-.232zm1.018-.08c-.137 0-.245.12-.248.261l-.063 2.353.063 1.965c.003.141.111.259.248.259.137 0 .245-.118.251-.259l.072-1.965-.072-2.353c-.006-.141-.114-.261-.251-.261zm1.939 2.544c0-.161-.136-.294-.296-.294-.161 0-.294.133-.297.294l-.063 1.944.063.07c.003.161.136.292.297.292.16 0 .296-.131.296-.292l.063-.07-.063-1.944zm.987-3.043c-.155 0-.284.143-.284.319l-.037 4.672.037 1.894c0 .176.129.318.284.318s.283-.142.287-.318l.04-1.894-.04-4.672c-.004-.176-.132-.319-.287-.319zm.99-.09c-.171 0-.311.153-.311.349l-.022 4.717.022 1.871c0 .196.14.349.311.349.172 0 .311-.153.315-.349l.024-1.871-.024-4.717c-.004-.196-.143-.349-.315-.349zm.99-.044c-.187 0-.338.167-.338.378v4.737l.022 1.843c0 .211.151.377.338.377s.338-.166.341-.377l.023-1.843-.023-4.737c-.003-.211-.154-.378-.341-.378-.022 0 .022 0 0 0zm1.967 1.77c-.187 0-.339.167-.339.379v2.946l.023 1.822c.002.211.152.378.339.378s.339-.167.341-.378l.024-1.822-.024-2.946c-.002-.212-.154-.379-.341-.379-.023 0 .023 0-.023 0zm.989-.43c-.203 0-.367.182-.367.408v3.354l.022 1.798c.002.226.164.407.367.407s.367-.181.369-.407l.024-1.798-.024-3.354c-.002-.226-.166-.408-.369-.408-.022 0 .022 0-.022 0zm2.012-1.203c-.221 0-.399.196-.399.438v4.514l.022 1.773c.002.242.178.436.399.436s.399-.194.401-.436l.024-1.773-.024-4.514c-.002-.242-.18-.438-.401-.438-.022 0 .022 0-.022 0zm1.025.108c-.236 0-.427.21-.427.469v4.363l.022 1.748c.002.259.191.467.427.467s.427-.208.429-.467l.024-1.748-.024-4.363c-.002-.259-.193-.469-.429-.469-.022 0 .022 0-.022 0z"/>
                    </svg>
                    <span className="text-xs text-orange-400">SoundCloud</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar */}
            <div
              className="w-full mb-4 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '35%',
                    background: `linear-gradient(to right, ${accentColor}, ${accentColor}aa)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1:24</span>
                <span>3:45</span>
              </div>
            </div>

            {/* Controls */}
            <div
              className="flex items-center justify-center gap-6 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <button className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="11 19 2 12 11 5 11 19" />
                  <polygon points="22 19 13 12 22 5 22 19" />
                </svg>
              </button>
              <button
                className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 4px 16px ${accentColor}40`,
                }}
              >
                <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <button className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 19 22 12 13 5 13 19" />
                  <polygon points="2 19 11 12 2 5 2 19" />
                </svg>
              </button>
            </div>

            {/* Powered by */}
            <p className="mt-auto pt-4 text-[10px] text-slate-500">
              Powered by QRWolf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
