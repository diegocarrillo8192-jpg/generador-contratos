export function Mark({
  id = "gmark",
  size = 48,
  className = "",
}: {
  id?: string;
  size?: number;
  className?: string;
}) {
  const g1 = `${id}-grad`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo Generador de Contratos"
    >
      <defs>
        <linearGradient id={g1} x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill={`url(#${g1})`} />
      <rect x="3.5" y="3.5" width="89" height="89" rx="21" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
      <rect x="29" y="17" width="37" height="56" rx="7" fill="#ffffff" />
      <rect x="36" y="29" width="23" height="4.5" rx="2.25" fill="#0b1526" opacity="0.85" />
      <rect x="36" y="39" width="23" height="4.5" rx="2.25" fill="#0b1526" opacity="0.85" />
      <rect x="36" y="49" width="15" height="4.5" rx="2.25" fill="#0b1526" opacity="0.85" />
      <rect x="29" y="58" width="37" height="1.5" fill="#0b1526" opacity="0.25" />
      <circle cx="62" cy="60" r="14" fill="#38bdf8" />
      <circle cx="62" cy="60" r="14" stroke="#0b1526" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M55.5 60.5l4.3 4.3 7.2-8.6" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
