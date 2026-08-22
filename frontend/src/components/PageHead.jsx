export default function PageHead({ eyebrow, title, action }) {
  return (
    <div className="page-head">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  );
}