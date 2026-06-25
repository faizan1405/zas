import React from 'react';

const InlineSVG = ({ type, width = '100%', height = '100%', className = '' }) => {
  // Electric Volt & Dark Slate styling for premium sports vector look
  const voltColor = '#CCFF00';
  const darkColor = '#1E293B';
  const midColor = '#64748B';
  const lightColor = '#E2E8F0';

  const svgMap = {
    'cricket-bats': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Grip handle */}
        <rect x="47" y="10" width="6" height="35" rx="3" fill={darkColor} />
        {/* Grip wrapping pattern */}
        <line x1="47" y1="18" x2="53" y2="20" stroke={voltColor} strokeWidth="1.5" />
        <line x1="47" y1="26" x2="53" y2="28" stroke={voltColor} strokeWidth="1.5" />
        <line x1="47" y1="34" x2="53" y2="36" stroke={voltColor} strokeWidth="1.5" />
        <line x1="47" y1="42" x2="53" y2="44" stroke={voltColor} strokeWidth="1.5" />
        {/* Handle cap */}
        <path d="M46 10H54V13H46V10Z" fill={voltColor} />
        {/* Joint shoulder */}
        <path d="M45 44H55L57 49H43L45 44Z" fill={midColor} />
        {/* Bat blade */}
        <path d="M43 49H57V82C57 85 54.5 87.5 51.5 87.5H48.5C45.5 87.5 43 85 43 82V49Z" fill={darkColor} />
        {/* Wood grains */}
        <line x1="46" y1="52" x2="46" y2="84" stroke={midColor} strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1="50" y1="50" x2="50" y2="86" stroke={midColor} strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1="54" y1="52" x2="54" y2="84" stroke={midColor} strokeWidth="0.75" strokeDasharray="3 3" />
        {/* Apex brand sticker on bat */}
        <rect x="45" y="55" width="10" height="8" fill={voltColor} rx="1" />
        <text x="50" y="61" fill="#0B0F19" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">APX</text>
      </svg>
    ),
    'cricket-balls': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Outer spherical sphere */}
        <circle cx="50" cy="50" r="30" fill="#DC2626" />
        {/* Ball highlights */}
        <path d="M30 40C38 30 62 30 70 40" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        {/* Spherical shadow */}
        <circle cx="50" cy="50" r="30" fill="url(#ballGlow)" />
        {/* Seam stitches */}
        <path d="M50 20C50 20 48 35 48 50C48 65 50 80 50 80" stroke="white" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        <path d="M50 20C50 20 52 35 52 50C52 65 50 80 50 80" stroke="white" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        <path d="M50 20C50 20 50 35 50 50C50 65 50 80 50 80" stroke={voltColor} strokeWidth="1" />
        <defs>
          <radialGradient id="ballGlow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0.4" />
          </radialGradient>
        </defs>
      </svg>
    ),
    'cricket-kits': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Duffle kit bag shape */}
        <rect x="25" y="30" width="50" height="48" rx="8" fill={darkColor} />
        {/* Zipper strap */}
        <rect x="25" y="44" width="50" height="4" fill={midColor} />
        <line x1="25" y1="46" x2="75" y2="46" stroke={voltColor} strokeWidth="1" strokeDasharray="2 2" />
        {/* Duffle handle strap */}
        <path d="M35 30V20H65V30" stroke={voltColor} strokeWidth="3" strokeLinecap="round" />
        {/* Crossing bat behind kit bag */}
        <path d="M22 22L32 12M32 12L34 14M34 14L24 24" fill={lightColor} stroke={darkColor} strokeWidth="1.5" />
        {/* Pad representation */}
        <rect x="33" y="54" width="14" height="20" rx="2" fill={midColor} />
        <line x1="33" y1="59" x2="47" y2="59" stroke={lightColor} strokeWidth="1" />
        <line x1="33" y1="64" x2="47" y2="64" stroke={lightColor} strokeWidth="1" />
        <line x1="33" y1="69" x2="47" y2="69" stroke={lightColor} strokeWidth="1" />
        {/* Brand logo label */}
        <rect x="52" y="58" width="14" height="10" fill={voltColor} rx="1" />
        <text x="59" y="65" fill="#0B0F19" fontSize="5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">APX</text>
      </svg>
    ),
    'protection-gear': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Helmet shape */}
        <path d="M30 45C30 31.2 41.2 20 55 20C68.8 20 80 31.2 80 45C80 50 80 55 77 58C74 61 68 62 55 62C42 62 36 61 33 58C30 55 30 50 30 45Z" fill={darkColor} />
        {/* Air vents */}
        <rect x="42" y="26" width="6" height="4" rx="2" fill="#0F172A" />
        <rect x="53" y="26" width="6" height="4" rx="2" fill="#0F172A" />
        <rect x="64" y="26" width="6" height="4" rx="2" fill="#0F172A" />
        {/* Visor Grill */}
        <path d="M32 50H78V52H32V50Z" fill={voltColor} />
        <path d="M34 56H76V58H34V56Z" fill={voltColor} />
        <path d="M50 50V74" stroke={voltColor} strokeWidth="2.5" />
        <path d="M38 50V68C38 72 42 74 50 74C58 74 62 72 62 68V50" stroke={voltColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="31" cy="48" r="4" fill={midColor} />
        <circle cx="79" cy="48" r="4" fill={midColor} />
      </svg>
    ),
    'shoes': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Shoe base sole */}
        <path d="M15 72C25 74 45 74 65 72C75 71 82 66 85 58H45L30 64L15 72Z" fill={midColor} />
        {/* Spikes outsole */}
        <rect x="18" y="72" width="67" height="4" fill={darkColor} rx="2" />
        {/* Spike pins */}
        <polygon points="25,76 27,82 29,76" fill={voltColor} />
        <polygon points="37,76 39,82 41,76" fill={voltColor} />
        <polygon points="49,76 51,82 53,76" fill={voltColor} />
        <polygon points="61,76 63,82 65,76" fill={voltColor} />
        <polygon points="73,76 75,82 77,76" fill={voltColor} />
        {/* Shoe Upper mesh */}
        <path d="M85 58C82 46 65 42 50 48L32 52L26 62C26 62 40 64 50 62L85 58Z" fill={darkColor} />
        {/* Lace and tongue */}
        <path d="M48 48L44 42L38 45" stroke={voltColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="52" x2="48" y2="48" stroke={voltColor} strokeWidth="1.5" />
        <line x1="38" y1="54" x2="44" y2="50" stroke={voltColor} strokeWidth="1.5" />
        {/* Heel collar */}
        <path d="M26 62C26 55 28 50 32 52" stroke={darkColor} strokeWidth="3" />
      </svg>
    ),
    'jerseys': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Jersey shape */}
        <path d="M32 20H68L85 34L77 42L72 38V85H28V38L23 42L15 34L32 20Z" fill={darkColor} />
        {/* V-Neck collar */}
        <path d="M44 20L50 28L56 20" stroke={voltColor} strokeWidth="3" strokeLinecap="round" />
        {/* Sleeves stripe */}
        <path d="M78 40L83 36" stroke={voltColor} strokeWidth="2.5" />
        <path d="M22 40L17 36" stroke={voltColor} strokeWidth="2.5" />
        {/* Dynamic volt panels on sides */}
        <path d="M28 48H31V80H28V48Z" fill={voltColor} />
        <path d="M69 48H72V80H69V48Z" fill={voltColor} />
        {/* APX brand stamp on chest */}
        <text x="50" y="44" fill={voltColor} fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">APX</text>
        <circle cx="50" cy="54" r="5" stroke={voltColor} strokeWidth="1" />
      </svg>
    ),
    'bags': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Bag shape */}
        <rect x="25" y="20" width="50" height="60" rx="6" fill={darkColor} />
        {/* Front pockets */}
        <rect x="30" y="48" width="40" height="26" rx="3" fill={midColor} />
        <rect x="30" y="28" width="40" height="16" rx="3" fill={midColor} />
        {/* Side elastic mesh pockets */}
        <path d="M22 45C22 40 25 40 25 45V65C25 70 22 70 22 65V45Z" fill={lightColor} />
        <path d="M78 45C78 40 75 40 75 45V65C75 70 78 70 78 65V45Z" fill={lightColor} />
        {/* Accent neon straps */}
        <line x1="34" y1="20" x2="34" y2="80" stroke={voltColor} strokeWidth="2" />
        <line x1="66" y1="20" x2="66" y2="80" stroke={voltColor} strokeWidth="2" />
      </svg>
    ),
    'accessories': (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
        {/* Water bottle shape */}
        <path d="M38 42C38 34 42 30 42 26V20H58V26C58 30 62 34 62 42V82C62 85 59.5 88 56.5 88H43.5C40.5 88 38 85 38 82V42Z" fill={darkColor} />
        {/* Cap lid */}
        <rect x="46" y="14" width="8" height="6" rx="1" fill={voltColor} />
        {/* Textured body strip */}
        <rect x="38" y="50" width="24" height="15" fill={voltColor} />
        <line x1="42" y1="53" x2="58" y2="53" stroke={darkColor} strokeWidth="1" />
        <line x1="42" y1="57" x2="58" y2="57" stroke={darkColor} strokeWidth="1" />
        <line x1="42" y1="61" x2="58" y2="61" stroke={darkColor} strokeWidth="1" />
        {/* Level lines on clear side panel */}
        <line x1="60" y1="36" x2="57" y2="36" stroke={midColor} strokeWidth="1" />
        <line x1="60" y1="42" x2="57" y2="42" stroke={midColor} strokeWidth="1" />
        <line x1="60" y1="72" x2="57" y2="72" stroke={midColor} strokeWidth="1" />
      </svg>
    )
  };

  const defaultSvg = (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
      {/* Standard geometric abstract sports crest */}
      <circle cx="50" cy="50" r="30" stroke={darkColor} strokeWidth="6" />
      <polygon points="50,30 65,60 35,60" fill={voltColor} />
      <circle cx="50" cy="50" r="5" fill={darkColor} />
    </svg>
  );

  return (
    <div className={`inline-svg-wrapper ${className}`} style={{ width, height, aspectRatio: '1/1' }}>
      {svgMap[type] || defaultSvg}
    </div>
  );
};

export default InlineSVG;
