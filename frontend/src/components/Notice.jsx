export default function Notice({ message }) {
  return message ? <div className="notice">{message}</div> : null;
}