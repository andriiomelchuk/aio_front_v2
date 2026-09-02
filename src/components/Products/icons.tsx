type T_HeartIconProps = {
  filled?: boolean;
};



export const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-11 w-11 scale-[1.45]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5h2l2 10h9l2-7H8" />
    <path d="M9 19h.01" />
    <path d="M17 19h.01" />
  </svg>
);

export const HeartIcon = ({ filled = false}: T_HeartIconProps) => (
  <svg
    viewBox="0 0 24 24"
    className="h-11 w-11 scale-[1.45]"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8a5.2 5.2 0 0 0 0-7.4Z" />
  </svg>
);

export const CompareIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-11 w-11 scale-[1.50]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3v18" />
    <path d="M5 7h14" />
    <path d="M6 7l-3 6h6L6 7Z" />
    <path d="M18 7l-3 6h6l-3-6Z" />
    <path d="M8 21h8" />
  </svg>
);