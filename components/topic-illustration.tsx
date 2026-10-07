"use client";
import Image from "next/image";
import { useId, useRef } from "react";
import { topics } from "@/lib/practice";
import { ArrowRight, Check, X } from "lucide-react";
import type { Progress, ProgressGroup } from "@/lib/writing-progress";
import { GroupProgress } from "./group-progress";

const artwork = [
  { slug: "everyday", caption: "Little chats. Everyday moments.", alt: "Lavender and coral friends chatting beside a houseplant" },
  { slug: "travel", caption: "A little language. A big adventure.", alt: "A mint explorer with a backpack and map" },
  { slug: "food", caption: "Good coffee. Better company.", alt: "Yellow and lavender friends sharing coffee at a café" },
  { slug: "work", caption: "Ready for your next big thing.", alt: "A coral character carrying a business briefcase" },
  { slug: "culture", caption: "New people. Shared discoveries.", alt: "A blue star and lavender friend enjoying music together" },
  { slug: "ideas", caption: "Give your bright ideas a voice.", alt: "A yellow arch character having a lightbulb moment" },
];

export function TopicIllustration({ topic, banner = false, onTopicChange, disabled, progress }: {
  topic: string;
  banner?: boolean;
  onTopicChange?: (topic: string) => void;
  disabled?: boolean;
  progress?: (group: ProgressGroup) => Progress;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const illustration = artwork[topics.findIndex((item) => item === topic)];
  if (!illustration) return null;

  if (banner && onTopicChange) return (
    <>
      <button
        type="button"
        className={`topic-illustration topic-illustration--${illustration.slug} topic-illustration--banner topic-banner-button`}
        onClick={() => dialog.current?.showModal()}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-label={`Change topic, currently ${topic}`}
      >
        <span className="topic-banner-copy">
          <span className="topic-banner-kicker">Your topic</span>
          <strong>{topic}</strong>
          <span>{illustration.caption}</span>
          {progress && <GroupProgress label={topic} progress={progress({ topic })} />}
        </span>
        <Image src={`/illustrations/topic-${illustration.slug}.webp`} alt="" width={768} height={512} sizes="(max-width: 760px) 112px, 180px" />
        <span className="topic-banner-action">Change topic <ArrowRight size={18} aria-hidden="true" /></span>
      </button>
      <dialog ref={dialog} className="topic-picker-dialog" aria-labelledby={titleId}>
        <div className="topic-picker-content">
          <header className="topic-picker-header">
            <div>
              <span className="topic-banner-kicker">A world of things to say</span>
              <h2 id={titleId}>What feels like you today?</h2>
              <p>Pick a topic. Make it your own.</p>
            </div>
            <button type="button" className="topic-picker-close" aria-label="Close topic picker" onClick={() => dialog.current?.close()}><X size={24} /></button>
          </header>
          <div className="topic-picker-grid">
            {topics.map((item, index) => {
              const art = artwork[index];
              const selected = item === topic;
              return (
                <button
                  key={item}
                  type="button"
                  className={`topic-picker-card topic-illustration--${art.slug}${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => {
                    dialog.current?.close();
                    if (!selected) onTopicChange(item);
                  }}
                >
                  {selected && <span className="topic-picker-selected"><Check size={15} /> Current topic</span>}
                  <Image src={`/illustrations/topic-${art.slug}.webp`} alt="" width={768} height={512} sizes="(max-width: 600px) 40vw, (max-width: 900px) 40vw, 280px" />
                  <strong>{item}</strong>
                  <span className="topic-picker-caption">{art.caption}</span>
                  {progress && <GroupProgress label={item} progress={progress({ topic: item })} />}
                </button>
              );
            })}
          </div>
        </div>
      </dialog>
    </>
  );

  return (
    <figure className={`topic-illustration topic-illustration--${illustration.slug}${banner ? " topic-illustration--banner" : ""}`}>
      <Image
        key={illustration.slug}
        src={`/illustrations/topic-${illustration.slug}.webp`}
        alt={illustration.alt}
        width={768}
        height={512}
        sizes={banner ? "(max-width: 760px) 112px, 180px" : "(max-width: 760px) 240px, 246px"}
      />
      <figcaption>
        {banner && <strong>{topic}</strong>}
        {illustration.caption}
        {banner && progress && <GroupProgress label={topic} progress={progress({ topic })} />}
      </figcaption>
    </figure>
  );
}
