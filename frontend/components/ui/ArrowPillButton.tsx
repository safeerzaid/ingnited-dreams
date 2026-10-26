import React from 'react';
import Link from 'next/link';

interface ArrowPillButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'dark' | 'lime' | 'yellow';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
}

export default function ArrowPillButton({
  href,
  onClick,
  children,
  variant = 'dark',
  className = '',
  type = 'button',
  target,
}: ArrowPillButtonProps) {
  const variantClass = variant === 'yellow' ? 'btn-yellow' : variant === 'lime' ? 'btn-lime' : '';
  const combinedClasses = `btn-pill-animated ${variantClass} ${className}`.trim();

  const iconContent = (
    <span className="btn-icon-wrapper" aria-hidden="true">
      <svg
        viewBox="0 0 14 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="btn-icon-svg"
        width={11}
        height={11}
      >
        <path
          d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
          fill="currentColor"
        />
      </svg>
      <svg
        viewBox="0 0 14 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="btn-icon-svg btn-icon-svg--copy"
        width={11}
        height={11}
      >
        <path
          d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
          fill="currentColor"
        />
      </svg>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} target={target}>
        {iconContent}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClasses}>
      {iconContent}
      <span>{children}</span>
    </button>
  );
}
