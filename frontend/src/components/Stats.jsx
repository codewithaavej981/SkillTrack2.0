import { BookOpen, Clock3, Target } from "lucide-react";

export default function Stats() {
  return (
    <section className="stats">
      <div>
        <span className="stat purple">
          <BookOpen />
        </span>
        <b>4</b>
        <p>Active skills</p>
        <small>+1 this month</small>
      </div>

      <div>
        <span className="stat orange">
          <Target />
        </span>
        <b>2</b>
        <p>Goals in progress</p>
        <small>1 completed</small>
      </div>

      <div>
        <span className="stat green">
          <Clock3 />
        </span>
        <b>12.5h</b>
        <p>Learning time</p>
        <small>+18% vs May</small>
      </div>
    </section>
  );
}