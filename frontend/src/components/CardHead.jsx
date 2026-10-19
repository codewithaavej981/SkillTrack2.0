import { Link } from "react-router-dom";

export default function CardHead({ title, text, link, linkText = "View all" }) {
  const isExternal =
    typeof link === "string" &&
    (link.startsWith("http://") ||
      link.startsWith("https://") ||
      link.startsWith("//") ||
      link.startsWith("mailto:"));

  return (
    <header className="card-head">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      {link &&
        (isExternal ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        ) : (
          <Link to={link}>{linkText}</Link>
        ))}
    </header>
  );
}
