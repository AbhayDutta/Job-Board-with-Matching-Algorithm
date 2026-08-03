"use client";

export default function DoodlePatternBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Minimalist Aesthetic Tech Doodle Seamless SVG Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.10] dark:opacity-[0.07] transition-opacity duration-300"
        style={{ color: "oklch(0.5 0.01 255)" }}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="minimal-aesthetic-doodle"
            x="0"
            y="0"
            width="280"
            height="280"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Minimal Rocket */}
              <path d="M 45 25 C 45 25 60 15 65 35 C 55 50 35 55 35 55 C 35 55 33 40 45 25 Z" />
              <circle cx="50" cy="34" r="2.5" />
              <path d="M 37 47 L 29 55" />

              {/* Minimal Chat Bubble */}
              <path d="M 170 35 C 170 28 182 28 192 28 C 202 28 214 28 214 35 C 214 42 202 42 192 42 C 185 42 180 46 177 48 L 178 42 Z" />

              {/* Code Brackets < /> */}
              <path d="M 110 80 L 102 88 L 110 96 M 125 80 L 133 88 L 125 96 M 121 78 L 114 98" />

              {/* Minimal Saturn */}
              <ellipse cx="230" cy="105" rx="12" ry="7" />
              <path d="M 213 105 C 215 113 245 113 247 105" />

              {/* Lightning Bolt */}
              <path d="M 45 140 L 35 155 L 43 155 L 36 170 L 53 150 L 43 150 Z" />

              {/* Minimal Headphones */}
              <path d="M 155 155 C 155 140 185 140 185 155 M 151 155 A 4 6 0 0 0 151 167 M 189 155 A 4 6 0 0 1 189 167" />

              {/* Minimalist Sparkle */}
              <path d="M 105 175 L 108 183 L 116 186 L 108 189 L 105 197 L 102 189 L 94 186 L 102 183 Z" />

              {/* Minimal Search / Lens */}
              <circle cx="235" cy="190" r="7" />
              <path d="M 240 195 L 248 203" />

              {/* Minimal Coffee Cup */}
              <path d="M 35 220 L 55 220 L 52 242 L 38 242 Z M 55 224 C 61 224 61 234 52 234" />

              {/* Minimal Diamond */}
              <path d="M 165 225 L 175 215 L 185 225 L 175 235 Z" />

              {/* Target / Bullseye */}
              <circle cx="105" cy="245" r="8" />
              <circle cx="105" cy="245" r="2.5" fill="currentColor" />

              {/* Aesthetic Micro Accents */}
              <circle cx="15" cy="100" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="140" cy="25" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="80" cy="120" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="205" cy="235" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="265" cy="45" r="1.5" fill="currentColor" opacity="0.6" />
              <path d="M 15 180 L 23 180 M 19 176 L 19 184" opacity="0.6" />
              <path d="M 130 205 L 138 213 M 138 205 L 130 213" opacity="0.6" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#minimal-aesthetic-doodle)" />
      </svg>
    </div>
  );
}
