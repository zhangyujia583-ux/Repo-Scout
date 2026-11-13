export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <circle cx="16" cy="16" r="7.25" fill="none" stroke="#f6f1e7" strokeWidth="1.4" />
      <path
        d="M16 8.6 17.55 14.15 23.2 16 17.55 17.85 16 23.4 14.45 17.85 8.8 16 14.45 14.15Z"
        fill="#e3874f"
      />
    </svg>
  );
}
