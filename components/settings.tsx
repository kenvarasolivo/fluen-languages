"use client";
import { Level, levels, topics, Settings } from "@/lib/practice";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
export function PracticeSettings({
  settings,
  onChange,
  disabled,
  conversation = false,
}: {
  settings: Settings;
  onChange: (settings: Settings) => void;
  disabled?: boolean;
  conversation?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  useEffect(
    () => setExpanded(window.matchMedia("(min-width: 761px)").matches),
    [],
  );
  return (
    <details
      className="settings-card"
      open={expanded}
      onToggle={(e) => setExpanded(e.currentTarget.open)}
    >
      <summary className="settings-title">
        <SlidersHorizontal size={18} />
        <h2>Your practice, your way</h2>
        <ChevronDown className="settings-chevron" size={15} />
      </summary>
      <fieldset disabled={disabled}>
        <legend>Your level</legend>
        <div className="level-picker">
          {levels.map((level) => (
            <button
              key={level}
              aria-pressed={settings.level === level}
              onClick={() => onChange({ ...settings, level: level as Level })}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="field-note">
          {
            {
              A1: "Little words. Big beginnings.",
              A2: "Build on the everyday basics.",
              B1: "Find your voice in familiar situations.",
              B2: "Express yourself with more detail.",
              C1: "Explore nuance and complex ideas.",
              C2: "Fine-tune your most fluent German.",
            }[settings.level]
          }
        </p>
      </fieldset>
      <label className="select-label">
        Your topic
        <div className="select-wrap">
          <select
            value={settings.topic}
            disabled={disabled}
            onChange={(e) => onChange({ ...settings, topic: e.target.value })}
          >
            {topics.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>
          <ChevronDown size={16} />
        </div>
      </label>
      {!conversation && (
        <fieldset disabled={disabled}>
          <legend>Sentence style</legend>
          <div className="format-picker">
            <button
              aria-pressed={settings.format === "single"}
              onClick={() => onChange({ ...settings, format: "single" })}
            >
              <strong>One sentence</strong>
              <span>One idea at a time</span>
            </button>
            <button
              aria-pressed={settings.format === "connected"}
              onClick={() => onChange({ ...settings, format: "connected" })}
            >
              <strong>Connect two ideas</strong>
              <span>Two sentences → use a Konnektor</span>
            </button>
          </div>
        </fieldset>
      )}
      <div className="settings-tip">
        <span>✦</span>
        <p>
          {conversation
            ? "A coffee chat or a big idea. There’s always something to talk about."
            : "Don’t know a word? Give it a try anyway. That’s how new words stick."}
        </p>
      </div>
    </details>
  );
}
