export default function PageHead({
  eyebrow,
  label,
  title,
  text,
  description,
  action,
}) {
  const badge = eyebrow || label;
  const subtitle = text || description;

  return (
    <div className="page-head">
      <div>
        {badge && <span className="eyebrow">{badge}</span>}
        {title && <h1>{title}</h1>}
        {subtitle && <p className="sub">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
