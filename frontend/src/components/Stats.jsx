import { Award, BookOpen, Target } from "lucide-react";

export default function Stats({
  skillsTotal = 0,
  skillsAvgProgress = 0,
  goalsInProgress = 0,
  goalsCompleted = 0,
  learningTotal = 0,
  learningCompleted = 0,
}) {
  return (
    <section className="stats">
      <div>
        <span className="stat purple">
          <Award />
        </span>
        <b>{skillsTotal}</b>
        <p>Active skills</p>
        <small>{skillsAvgProgress}% avg progress</small>
      </div>

      <div>
        <span className="stat orange">
          <Target />
        </span>
        <b>{goalsInProgress}</b>
        <p>Goals in progress</p>
        <small>{goalsCompleted} completed</small>
      </div>

      <div>
        <span className="stat green">
          <BookOpen />
        </span>
        <b>{learningTotal}</b>
        <p>Learning resources</p>
        <small>{learningCompleted} completed</small>
      </div>
    </section>
  );
}
