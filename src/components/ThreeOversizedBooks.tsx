import React, { useState } from 'react';

interface ThreeOversizedBooksProps {
  onNavigateCategory?: (categorySlug: string) => void;
  onExploreAll?: () => void;
}

export const ThreeOversizedBooks: React.FC<ThreeOversizedBooksProps> = ({
  onNavigateCategory,
  onExploreAll
}) => {
  const [hoveredBook, setHoveredBook] = useState<'orange' | 'navy' | 'yellow' | null>(null);

  const handleBookClick = (category: string) => {
    if (onNavigateCategory) {
      onNavigateCategory(category);
    } else if (onExploreAll) {
      onExploreAll();
    }
  };

  // Reusable 8-pointed black star badge inside crisp white circle
  const renderStarBadge = () => (
    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white shadow-[0_3px_10px_rgba(0,0,0,0.18)] flex items-center justify-center select-none shrink-0 transition-transform duration-300 group-hover:scale-105 border border-white/60">
      <svg 
        viewBox="0 0 24 24" 
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#080B0F] fill-current" 
        aria-hidden="true"
      >
        {/* Crisp 8-point geometric compass star */}
        <polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" />
      </svg>
    </div>
  );

  return (
    <div className="relative w-full max-w-[560px] lg:max-w-[580px] xl:max-w-[620px] h-[380px] sm:h-[420px] md:h-[460px] lg:h-[480px] xl:h-[500px] flex items-end justify-center select-none oversized-books-stage">
      
      {/* Ambient warm floor lighting reflection */}
      <div 
        className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[92%] h-24 rounded-full pointer-events-none opacity-40 blur-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 180, 25, 0.18) 0%, rgba(240, 75, 25, 0.12) 40%, transparent 75%)'
        }}
        aria-hidden="true"
      />

      {/* =========================================================================
          BOOK 2: DARK NAVY ("MODERN IDEAS")
          Positioned slightly behind/alongside the orange book, rich deep navy-blue (#132B47)
          ========================================================================= */}
      <div 
        className={`absolute z-10 w-[150px] sm:w-[172px] md:w-[188px] lg:w-[204px] xl:w-[214px] h-[285px] sm:h-[330px] md:h-[365px] lg:h-[395px] xl:h-[415px] bottom-5 sm:bottom-6 lg:bottom-8 left-[23%] sm:left-[24%] md:left-[26%] lg:left-[27%] oversized-3d-book cursor-pointer group`}
        style={{
          transform: hoveredBook === 'navy'
            ? 'rotateZ(-1.5deg) rotateY(10deg) translateY(-10px) translateZ(8px)'
            : 'rotateZ(-2deg) rotateY(8deg) translateY(0px) translateZ(-10px)',
          transformOrigin: 'bottom center'
        }}
        onMouseEnter={() => setHoveredBook('navy')}
        onMouseLeave={() => setHoveredBook(null)}
        onClick={() => handleBookClick('modern')}
        role="button"
        tabIndex={0}
        aria-label="Modern Ideas - Explore Collection"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBookClick('modern');
          }
        }}
      >
        {/* Soft realistic cast shadow */}
        <div 
          className="book-ground-shadow" 
          style={{
            opacity: hoveredBook === 'navy' ? 0.45 : 0.3,
            transform: 'rotateX(75deg) translateZ(-15px) scale(1.05)'
          }}
        />

        {/* 3D Top Stacked Paper Pages Edge */}
        <div className="book-top-pages" />

        {/* 3D Right Side Stacked Pages Rim */}
        <div className="book-side-pages" />

        {/* 3D Left Spine Edge */}
        <div 
          className="book-spine-side"
          style={{
            background: 'linear-gradient(90deg, #0A1726 0%, #17365A 45%, #10263E 85%, #0B1A2C 100%)'
          }}
        />

        {/* Front Cover Container */}
        <div 
          className="relative w-full h-full rounded-r-[3px] rounded-l-[1px] overflow-hidden flex flex-col justify-between p-5 sm:p-6 md:p-7"
          style={{
            backgroundColor: '#132B47',
            background: 'linear-gradient(145deg, #1A395E 0%, #132B47 45%, #0D1E32 100%)',
            boxShadow: `
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset -1px -1px 2px rgba(0, 0, 0, 0.35),
              -10px 14px 28px -5px rgba(8, 18, 30, 0.35),
              -3px 6px 12px -2px rgba(8, 18, 30, 0.2)
            `
          }}
        >
          {/* Subtle paper grain & gloss */}
          <div className="book-surface-sheen" />
          <div className="book-hinge-crease" />
          <div className="book-cover-frame" />

          {/* Upper: White Circle Badge with Black Star */}
          <div className="relative z-10 flex items-start justify-start pt-0.5">
            {renderStarBadge()}
          </div>

          {/* Lower: "MODERN IDEAS" printed vertically in pure white */}
          <div className="relative z-10 pb-3 sm:pb-5 flex items-start justify-start">
            <span 
              className="font-sans font-black tracking-[0.26em] text-white text-xs sm:text-[13px] md:text-[14px] uppercase select-none leading-none opacity-95 group-hover:opacity-100 transition-opacity drop-shadow-xs"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}
            >
              MODERN IDEAS
            </span>
          </div>

          {/* Decorative subtle volume index */}
          <div className="absolute right-3.5 bottom-3 text-[9px] font-mono tracking-widest text-white/35 uppercase select-none">
            VOL · 02
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOOK 1: VIVID TANGERINE ORANGE ("CLASSICS")
          Positioned lower-left, tilted to left, forward in Z-space, vivid orange (#F1511B)
          ========================================================================= */}
      <div 
        className={`absolute z-20 w-[155px] sm:w-[178px] md:w-[195px] lg:w-[210px] xl:w-[220px] h-[295px] sm:h-[340px] md:h-[375px] lg:h-[405px] xl:h-[425px] bottom-0 left-[4%] sm:left-[6%] md:left-[8%] lg:left-[9%] oversized-3d-book cursor-pointer group`}
        style={{
          transform: hoveredBook === 'orange'
            ? 'rotateZ(-6.5deg) rotateY(8deg) translateY(-10px) translateZ(28px)'
            : 'rotateZ(-7.5deg) rotateY(6deg) translateY(0px) translateZ(16px)',
          transformOrigin: 'bottom center'
        }}
        onMouseEnter={() => setHoveredBook('orange')}
        onMouseLeave={() => setHoveredBook(null)}
        onClick={() => handleBookClick('classics')}
        role="button"
        tabIndex={0}
        aria-label="Classics - Explore Collection"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBookClick('classics');
          }
        }}
      >
        {/* Soft realistic cast shadow */}
        <div 
          className="book-ground-shadow" 
          style={{
            opacity: hoveredBook === 'orange' ? 0.48 : 0.35,
            transform: 'rotateX(75deg) translateZ(-12px) scale(1.1)'
          }}
        />

        {/* 3D Top Stacked Paper Pages Edge */}
        <div className="book-top-pages" />

        {/* 3D Right Side Stacked Pages Rim */}
        <div className="book-side-pages" />

        {/* 3D Left Spine Edge */}
        <div 
          className="book-spine-side"
          style={{
            background: 'linear-gradient(90deg, #9C2C07 0%, #F55F2C 45%, #D43907 85%, #842303 100%)'
          }}
        />

        {/* Front Cover Container */}
        <div 
          className="relative w-full h-full rounded-r-[3px] rounded-l-[1px] overflow-hidden flex flex-col justify-between p-5 sm:p-6 md:p-7"
          style={{
            backgroundColor: '#F1511B',
            background: 'linear-gradient(145deg, #F8602D 0%, #F1511B 45%, #D43907 100%)',
            boxShadow: `
              inset 0 1px 1px rgba(255, 255, 255, 0.35),
              inset -1px -1px 2px rgba(0, 0, 0, 0.3),
              -12px 18px 32px -6px rgba(160, 40, 10, 0.35),
              -4px 8px 14px -3px rgba(160, 40, 10, 0.2)
            `
          }}
        >
          {/* Subtle paper grain & gloss */}
          <div className="book-surface-sheen" />
          <div className="book-hinge-crease" />
          <div className="book-cover-frame" />

          {/* Upper: White Circle Badge with Black Star */}
          <div className="relative z-10 flex items-start justify-start pt-0.5">
            {renderStarBadge()}
          </div>

          {/* Lower: "CLASSICS" printed vertically in pure white */}
          <div className="relative z-10 pb-3 sm:pb-5 flex items-start justify-start">
            <span 
              className="font-sans font-black tracking-[0.28em] text-white text-xs sm:text-[13px] md:text-[14px] uppercase select-none leading-none opacity-95 group-hover:opacity-100 transition-opacity drop-shadow-xs"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}
            >
              CLASSICS
            </span>
          </div>

          {/* Decorative subtle volume index */}
          <div className="absolute right-3.5 bottom-3 text-[9px] font-mono tracking-widest text-white/40 uppercase select-none">
            VOL · 01
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOOK 3: SATURATED GOLDEN YELLOW ("FICTION")
          Positioned to right, tall, visually dominant, slightly tilted (~ +5.5deg), golden-yellow (#F7BA1E)
          ========================================================================= */}
      <div 
        className={`absolute z-30 w-[160px] sm:w-[184px] md:w-[202px] lg:w-[218px] xl:w-[228px] h-[305px] sm:h-[350px] md:h-[385px] lg:h-[420px] xl:h-[440px] bottom-1 sm:bottom-2 lg:bottom-3 right-[2%] sm:right-[4%] md:right-[6%] lg:right-[7%] oversized-3d-book cursor-pointer group`}
        style={{
          transform: hoveredBook === 'yellow'
            ? 'rotateZ(4.5deg) rotateY(-4deg) translateY(-10px) translateZ(32px)'
            : 'rotateZ(5.5deg) rotateY(-5deg) translateY(0px) translateZ(20px)',
          transformOrigin: 'bottom center'
        }}
        onMouseEnter={() => setHoveredBook('yellow')}
        onMouseLeave={() => setHoveredBook(null)}
        onClick={() => handleBookClick('fiction')}
        role="button"
        tabIndex={0}
        aria-label="Fiction - Explore Collection"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBookClick('fiction');
          }
        }}
      >
        {/* Soft realistic cast shadow */}
        <div 
          className="book-ground-shadow" 
          style={{
            opacity: hoveredBook === 'yellow' ? 0.42 : 0.28,
            transform: 'rotateX(75deg) translateZ(-12px) scale(1.1)'
          }}
        />

        {/* 3D Top Stacked Paper Pages Edge */}
        <div className="book-top-pages" />

        {/* 3D Right Side Stacked Pages Rim */}
        <div className="book-side-pages" />

        {/* 3D Left Spine Edge */}
        <div 
          className="book-spine-side"
          style={{
            background: 'linear-gradient(90deg, #A87C04 0%, #FFCC38 45%, #E2A305 85%, #8C6200 100%)'
          }}
        />

        {/* Front Cover Container */}
        <div 
          className="relative w-full h-full rounded-r-[3px] rounded-l-[1px] overflow-hidden flex flex-col justify-between p-5 sm:p-6 md:p-7"
          style={{
            backgroundColor: '#F7BA1E',
            background: 'linear-gradient(145deg, #FFC730 0%, #F7BA1E 45%, #E09F04 100%)',
            boxShadow: `
              inset 0 1px 1px rgba(255, 255, 255, 0.45),
              inset -1px -1px 2px rgba(0, 0, 0, 0.22),
              -14px 20px 34px -6px rgba(160, 115, 10, 0.3),
              -4px 8px 16px -3px rgba(160, 115, 10, 0.18)
            `
          }}
        >
          {/* Subtle paper grain & gloss */}
          <div className="book-surface-sheen" />
          <div className="book-hinge-crease" />
          <div className="book-cover-frame" />

          {/* Upper: White Circle Badge with Black Star */}
          <div className="relative z-10 flex items-start justify-start pt-0.5">
            {renderStarBadge()}
          </div>

          {/* Lower: "FICTION" printed vertically in pure white */}
          <div className="relative z-10 pb-3 sm:pb-5 flex items-start justify-start">
            <span 
              className="font-sans font-black tracking-[0.28em] text-white text-xs sm:text-[13px] md:text-[14px] uppercase select-none leading-none opacity-95 group-hover:opacity-100 transition-opacity drop-shadow-xs"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}
            >
              FICTION
            </span>
          </div>

          {/* Decorative subtle volume index */}
          <div className="absolute right-3.5 bottom-3 text-[9px] font-mono tracking-widest text-white/45 uppercase select-none">
            VOL · 03
          </div>
        </div>
      </div>

    </div>
  );
};
