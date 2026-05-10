import { ImageResponse } from 'next/og'

/**
 * Default Open Graph image — 1200×630, generowane runtime przez Next.
 * Używane gdy strona nie ma własnego og-image.
 *
 * Design: ciemne tło iron-950 + akcent precision-blue-500 + Logo wordmark + headline.
 */

export const runtime = 'edge'

export const alt = 'Mandatomat — odwołania od mandatów w 3 minuty'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090B',
          color: 'white',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Accent dot */}
        <div
          style={{
            position: 'absolute',
            top: 90,
            right: 110,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#60A5FA',
            boxShadow: '0 0 80px 24px rgba(96, 165, 250, 0.45)',
          }}
        />

        {/* Overline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 18,
            letterSpacing: '0.18em',
            color: '#60A5FA',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
            }}
          />
          MANDATOMAT.PL
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
          }}
        >
          <span>Odwołaj mandat</span>
          <span style={{ color: '#60A5FA' }}>w 3 minuty.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: '#A1A1AA',
            lineHeight: 1.4,
          }}
        >
          AI + 100+ podstaw prawnych. Bez prawnika. 76% skuteczność.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            gap: 48,
            paddingTop: 32,
            borderTop: '1px solid #27272A',
            fontSize: 20,
            color: '#71717A',
            fontFamily: 'monospace',
          }}
        >
          <div>3 MIN ŚREDNIO</div>
          <div>76% SKUTECZNOŚĆ</div>
          <div>34 TYPY PISM</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
