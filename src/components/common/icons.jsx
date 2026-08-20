/**
 * Small hand-rolled outline icon set (20px, stroke = currentColor).
 * Replaces emoji glyphs used for icons — emoji render inconsistently
 * across operating systems/browsers and read poorly to screen readers,
 * which undermines both the visual consistency and accessibility of a
 * "professional developer tool" aesthetic. Each icon is decorative by
 * default (aria-hidden) — the surrounding button/element carries the
 * accessible name via aria-label or visible text.
 */

const defaultProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export function MenuIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="10" cy="10" r="2.75" />
      <path d="M10 2.75v1.7M10 15.55v1.7M17.25 10h-1.7M4.45 10h-1.7M15.1 4.9l-1.2 1.2M6.1 13.9l-1.2 1.2M15.1 15.1l-1.2-1.2M6.1 6.1L4.9 4.9" />
    </svg>
  );
}

export function SendIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M17 3 3 9.5l6 2 2 6L17 3Z" strokeLinejoin="round" />
      <path d="M17 3 9.5 11.5" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M12.5 3.5 16.5 7.5 7 17H3v-4L12.5 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M6 6v9.5A1.5 1.5 0 0 0 7.5 17h5a1.5 1.5 0 0 0 1.5-1.5V6" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4.5 7.5 10 13l5.5-5.5" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}
