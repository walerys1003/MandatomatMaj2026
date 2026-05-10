/**
 * Siatka perspektywiczna w tle Hero — czysty SVG (server-render).
 * - 60×60 px grid, opacity 0.6
 * - radial mask zanikający do brzegów
 * - accent dot 8px precision-blue-400 @ 0.4 (prawy górny róg)
 *
 * Klasa absolute — komponent ma być zagnieżdżony w relative parent.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid SVG */}
      <svg
        className="absolute inset-0 h-full w-full opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-iron-200 dark:text-iron-800"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Accent dot prawy górny */}
      <div
        className="absolute right-[12%] top-[18%] h-2 w-2 rounded-full bg-precision-blue-400 opacity-40 blur-[1px]"
        style={{ boxShadow: '0 0 32px 8px rgb(96 165 250 / 0.35)' }}
      />

      {/* Radial gradient warm spot dla głębi */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-precision-blue-100/40 blur-3xl dark:bg-precision-blue-900/20" />
    </div>
  )
}
