import React from 'react';

interface EditorialTitleProps {
  lines: string[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  italicWordIndex?: number;
}

export const EditorialTitle: React.FC<EditorialTitleProps> = ({
  lines,
  size = 'lg',
  className = '',
  italicWordIndex,
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl leading-[0.95]',
    md: 'text-4xl sm:text-5xl leading-[0.92]',
    lg: 'text-5xl sm:text-6xl md:text-7xl leading-[0.9]',
    xl: 'text-6xl sm:text-7xl md:text-8xl leading-[0.88]',
  };

  return (
    <div className={`font-serif tracking-tight uppercase select-none text-content-primary ${sizeClasses[size]} ${className}`}>
      {lines.map((line, idx) => (
        <div
          key={idx}
          className={`${italicWordIndex === idx ? 'italic font-normal opacity-90' : 'font-normal'}`}
        >
          {line}
        </div>
      ))}
    </div>
  );
};
