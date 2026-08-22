export default function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`btn ${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}