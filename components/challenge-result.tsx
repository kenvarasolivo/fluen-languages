import { Heart } from "lucide-react";
import Image from "next/image";

export function ChallengeResult({ correct }: { correct: boolean }) {
  return (
    <div
      className={`challenge-result ${correct ? "challenge-win" : "challenge-loss"}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {correct && (
        <div className="win-confetti" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} style={{ "--piece": i } as React.CSSProperties} />
          ))}
        </div>
      )}
      <span className="result-medal" aria-hidden="true">
        {correct ? (
          <Image
            src="/illustrations/fluen-shape-friends.png"
            alt=""
            width={96}
            height={80}
          />
        ) : (
          <Heart size={30} />
        )}
      </span>
      <div>
        <span className="result-label">
          {correct ? "YES! YOU SAID IT." : "A LITTLE ADJUSTMENT"}
        </span>
        <h3>
          {correct
            ? "You made it yours!"
            : "Not quite yet. You’re getting there."}
        </h3>
        <p>
          {correct
            ? "That’s your own sentence, in another language. Nicely done!"
            : "Check the correction below, then retry this sentence."}
        </p>
      </div>
    </div>
  );
}
