import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'bunny', name: 'Mochi Bunny', color: '#FFD6E7', badgeBg: 'bg-pink-100' },
  { id: 'kitty', name: 'Boba Kitty', color: '#FFE4E6', badgeBg: 'bg-rose-100' },
  { id: 'bear', name: 'Honey Bear', color: '#FFEDD5', badgeBg: 'bg-amber-100' },
  { id: 'pup', name: 'Caramel Pup', color: '#FEF3C7', badgeBg: 'bg-yellow-100' },
  { id: 'fox', name: 'Berry Fox', color: '#FEE2E2', badgeBg: 'bg-red-100' },
  { id: 'panda', name: 'Bamboo Panda', color: '#E0E7FF', badgeBg: 'bg-indigo-100' },
  { id: 'chick', name: 'Sunny Chick', color: '#FEF9C3', badgeBg: 'bg-amber-50' },
  { id: 'sheep', name: 'Cloud Sheep', color: '#EDE9FE', badgeBg: 'bg-purple-100' },
];

export function KawaiiAvatar({
  id = 'bunny',
  size = 48,
  className = '',
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  switch (id) {
    case 'kitty':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`rounded-full shadow-sm ${className}`}
        >
          <circle cx="50" cy="50" r="48" fill="#FFF1F2" />
          {/* Ears */}
          <polygon points="22,38 34,14 44,30" fill="#FDA4AF" />
          <polygon points="26,35 34,20 40,30" fill="#FFE4E6" />
          <polygon points="78,38 66,14 56,30" fill="#FDA4AF" />
          <polygon points="74,35 66,20 60,30" fill="#FFE4E6" />
          {/* Head */}
          <circle cx="50" cy="55" r="34" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="39" cy="52" r="4" fill="#514454" />
          <circle cx="41" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="61" cy="52" r="4" fill="#514454" />
          <circle cx="63" cy="50" r="1.5" fill="#FFFFFF" />
          {/* Blush */}
          <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="68" cy="58" rx="5" ry="3" fill="#FDA4AF" opacity="0.65" />
          {/* Nose & Mouth */}
          <polygon points="49,57 51,57 50,59" fill="#FB7185" />
          <path d="M46 60 Q50 64 50 61 Q50 64 54 60" stroke="#514454" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Whiskers */}
          <line x1="24" y1="53" x2="16" y2="51" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="58" x2="16" y2="60" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1="76" y1="53" x2="84" y2="51" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1="76" y1="58" x2="84" y2="60" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'bear':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`rounded-full shadow-sm ${className}`}
        >
          <circle cx="50" cy="50" r="48" fill="#FFFBEB" />
          {/* Ears */}
          <circle cx="26" cy="30" r="12" fill="#FCD34D" />
          <circle cx="26" cy="30" r="7" fill="#FDE68A" />
          <circle cx="74" cy="30" r="12" fill="#FCD34D" />
          <circle cx="74" cy="30" r="7" fill="#FDE68A" />
          {/* Head */}
          <circle cx="50" cy="55" r="33" fill="#FDE68A" stroke="#FCD34D" strokeWidth="2" />
          {/* Snout */}
          <ellipse cx="50" cy="62" rx="14" ry="10" fill="#FFFFFF" />
          <ellipse cx="50" cy="58" rx="4" ry="2.5" fill="#78350F" />
          <path d="M47 62 Q50 65 53 62" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Eyes */}
          <circle cx="37" cy="50" r="4" fill="#78350F" />
          <circle cx="38.5" cy="48.5" r="1.5" fill="#FFFFFF" />
          <circle cx="63" cy="50" r="4" fill="#78350F" />
          <circle cx="64.5" cy="48.5" r="1.5" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="29" cy="58" r="4.5" fill="#FCA5A5" opacity="0.6" />
          <circle cx="71" cy="58" r="4.5" fill="#FCA5A5" opacity="0.6" />
        </svg>
      );

    case 'pup':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`rounded-full shadow-sm ${className}`}
        >
          <circle cx="50" cy="50" r="48" fill="#FEF3C7" />
          {/* Floppy Ears */}
          <ellipse cx="20" cy="48" rx="10" ry="18" fill="#D97706" transform="rotate(-15 20 48)" />
          <ellipse cx="80" cy="48" rx="10" ry="18" fill="#D97706" transform="rotate(15 80 48)" />
          {/* Head */}
          <circle cx="50" cy="54" r="32" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="38" cy="50" r="4" fill="#451A03" />
          <circle cx="39.5" cy="48" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="50" r="4" fill="#451A03" />
          <circle cx="63.5" cy="48" r="1.5" fill="#FFFFFF" />
          {/* Snout & Tongue */}
          <ellipse cx="50" cy="62" rx="11" ry="8" fill="#FFFFFF" />
          <polygon points="47,58 53,58 50,62" fill="#78350F" />
          <path d="M47 64 Q50 67 53 64" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="50" cy="67" rx="3" ry="4" fill="#F43F5E" />
          {/* Blush */}
          <circle cx="30" cy="57" r="4" fill="#FDA4AF" opacity="0.7" />
          <circle cx="70" cy="57" r="4" fill="#FDA4AF" opacity="0.7" />
        </svg>
      );

    case 'fox':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`rounded-full shadow-sm ${className}`}
        >
          <circle cx="50" cy="50" r="48" fill="#FFF1F2" />
          {/* Big Fox Ears */}
          <polygon points="20,40 30,12 45,30" fill="#FB923C" />
          <polygon points="24,37 32,18 40,30" fill="#431407" />
          <polygon points="80,40 70,12 55,30" fill="#FB923C" />
          <polygon points="76,37 68,18 60,30" fill="#431407" />
          {/* Head */}
          <circle cx="50" cy="55" r="32" fill="#FB923C" />
          {/* White cheeks */}
          <path d="M22 62 Q35 78 50 66 Q65 78 78 62 Q68 45 50 50 Q32 45 22 62 Z" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="38" cy="50" r="4" fill="#431407" />
          <circle cx="40" cy="48" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="50" r="4" fill="#431407" />
          <circle cx="64" cy="48" r="1.5" fill="#FFFFFF" />
          {/* Cute Nose */}
          <circle cx="50" cy="62" r="3.5" fill="#431407" />
          {/* Blush */}
          <circle cx="30" cy="60" r="4" fill="#FB7185" opacity="0.7" />
          <circle cx="70" cy="60" r="4" fill="#FB7185" opacity="0.7" />
        </svg>
      );

    case 'panda':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`rounded-full shadow-sm ${className}`}
        >
          <circle cx="50" cy="50" r="48" fill="#F8FAFC" />
          {/* Black Ears */}
          <circle cx="26" cy="28" r="12" fill="#334155" />
          <circle cx="74" cy="28" r="12" fill="#334155" />
          {/* White Head */}
          <circle cx="50" cy="55" r="33" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          {/* Eye Patches */}
          <ellipse cx="36" cy="51" rx="8" ry="10" fill="#334155" transform="rotate(-15 36 51)" />
          <ellipse cx="64" cy="51" rx="8" ry="10" fill="#334155" transform="rotate(15 64 51)" />
          {/* Eyes */}
          <circle cx="36" cy="50" r="3" fill="#FFFFFF" />
          <circle cx="37" cy="49" r="1.2" fill="#0F172A" />
          <circle cx="64" cy="50" r="3" fill="#FFFFFF" />
          <circle cx="65" cy="49" r="1.2" fill="#0F172A" />
          {/* Nose & Mouth */}
          <ellipse cx="50" cy="61" rx="4" ry="2.5" fill="#334155" />
          <path d="M47 64 Q50 67 53 64" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Blush */}
          <circle cx="27" cy="60" r="4.5" fill="#F472B6" opacity="0.6" />
          <circle cx="73" cy="60" r="4.5" fill="#F472B6" opacity="0.6" />
        </svg>
      );

    case 'bunny':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`rounded-full shadow-sm ${className}`}
        >
          <circle cx="50" cy="50" r="48" fill="#FFF0F5" />
          {/* Bunny Ears */}
          <ellipse cx="35" cy="26" rx="8" ry="20" fill="#FFFFFF" stroke="#FFD6E7" strokeWidth="2" transform="rotate(-8 35 26)" />
          <ellipse cx="35" cy="26" rx="4.5" ry="13" fill="#FFB6C1" transform="rotate(-8 35 26)" />
          <ellipse cx="65" cy="26" rx="8" ry="20" fill="#FFFFFF" stroke="#FFD6E7" strokeWidth="2" transform="rotate(8 65 26)" />
          <ellipse cx="65" cy="26" rx="4.5" ry="13" fill="#FFB6C1" transform="rotate(8 65 26)" />
          {/* Head */}
          <circle cx="50" cy="56" r="32" fill="#FFFFFF" stroke="#FFD6E7" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="38" cy="52" r="4" fill="#514454" />
          <circle cx="40" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="52" r="4" fill="#514454" />
          <circle cx="64" cy="50" r="1.5" fill="#FFFFFF" />
          {/* Blush Cheeks */}
          <ellipse cx="30" cy="59" rx="5.5" ry="3.5" fill="#FF85A2" opacity="0.65" />
          <ellipse cx="70" cy="59" rx="5.5" ry="3.5" fill="#FF85A2" opacity="0.65" />
          {/* Nose & Mouth */}
          <polygon points="49,58 51,58 50,60" fill="#FF6B95" />
          <path d="M46 62 Q50 65 50 63 Q50 65 54 62" stroke="#514454" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Hair Flower */}
          <circle cx="64" cy="40" r="3.5" fill="#F472B6" />
          <circle cx="64" cy="40" r="1.5" fill="#FEF08A" />
        </svg>
      );
  }
}

