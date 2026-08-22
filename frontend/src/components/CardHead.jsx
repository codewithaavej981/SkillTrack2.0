export default function CardHead({ title, text, link }) {
  return (
    <header className="card-head">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      {link && <a href={link}>View all</a>}
    </header>
  );
}