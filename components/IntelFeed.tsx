'use client'

interface BriefItem {
  text: string
  type?: string
}

interface BriefSection {
  title: string
  items: BriefItem[]
}

interface Brief {
  id: string
  title: string
  date: string
  sections: BriefSection[]
}

export default function IntelFeed({ brief, loading }: { brief: Brief | null; loading: boolean }) {
  return (
    <div className="war-panel h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-war-accent text-sm">▸</span>
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-war-accent font-display">
            Intel Feed
          </h2>
        </div>
        {brief && (
          <span className="text-xs font-mono text-war-muted px-2 py-0.5 bg-war-border/30 rounded">
            Latest Brief
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 border-2 border-war-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-war-muted text-xs font-mono">Decrypting intel...</span>
          </div>
        ) : !brief ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-war-muted text-3xl">📡</span>
            <span className="text-war-muted text-xs font-mono">No briefs available</span>
            <span className="text-war-muted/50 text-xs font-mono italic">Radio silence</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Brief header */}
            <div className="p-3 rounded bg-war-bg/50 border border-war-border/30">
              <h3 className="text-sm font-mono text-war-accent font-semibold mb-1">
                {brief.title}
              </h3>
              <p className="text-[10px] font-mono text-war-muted">
                {new Date(brief.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'America/Phoenix'
                })}
              </p>
            </div>

            {/* Brief sections */}
            {brief.sections?.map((section, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider uppercase text-war-text font-display flex items-center gap-2">
                  <span className="w-4 h-px bg-war-accent" />
                  {section.title}
                </h4>
                <div className="space-y-1.5 pl-3 border-l border-war-border/30">
                  {section.items?.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-war-accent text-[10px] mt-1 flex-shrink-0">▹</span>
                      <p className="text-xs font-mono text-war-text/80 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-war-border/50">
        <div className="text-xs font-mono text-war-muted text-center">
          Source: SITREP Briefs · Classification: FOUO
        </div>
      </div>
    </div>
  )
}
