export default function Progress({ value, color = "#6956e7" }) {
  return (
    <div className="progress">
      <span
        style={{
          width: `${value}%`,
          background: color,
        }}
      />
    </div>
  );
}