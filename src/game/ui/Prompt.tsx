"use client";

import { useEffect } from "react";
import type { AnswerOption, Puzzle, Tense } from "@/lib/types";

export const TENSE_LABEL: Record<Tense, { es: string; en: string; hint: string; color: string }> = {
  imperfect: { es: "imperfecto", en: "imperfect", hint: "background · habit · ongoing", color: "var(--imperfect)" },
  preterite: { es: "indefinido", en: "preterite", hint: "event · completed · interrupts", color: "var(--preterite)" },
};

interface PromptProps {
  puzzle: Puzzle;
  options: AnswerOption[];
  solved: boolean;
  wrong: string[];
  onChoose: (o: AnswerOption) => void;
  onClose: () => void;
}

/** Cloze prompt for one memory fragment. */
export function Prompt({ puzzle, options, solved, wrong, onChoose, onClose }: PromptProps) {
  const correct = options.find((o) => o.correct);
  const answered = solved || wrong.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (solved && e.key === "Enter")) return onClose();
      const i = Number(e.key) - 1;
      if (!solved && options[i] && !wrong.includes(options[i].form)) onChoose(options[i]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, solved, wrong, onChoose, onClose]);

  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center bg-ink/25 p-4 pb-6 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Memory fragment"
        className="panel w-full max-w-xl animate-pop p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-widest text-ink/60">
          <span>Memory fragment</span>
          <span>
            verb: <em className="font-bold normal-case tracking-normal text-ink">{puzzle.verb_base}</em>
          </span>
        </div>

        <p lang="es" className="text-xl font-bold leading-snug sm:text-2xl">
          {puzzle.sentence_pre}
          <span
            className="mx-1 inline-block min-w-24 border-b-4 px-2 text-center"
            style={{ borderColor: solved && correct ? TENSE_LABEL[correct.type].color : "var(--ink)" }}
          >
            {solved && correct ? correct.form : " ? "}
          </span>
          {puzzle.sentence_post}
        </p>

        {solved && puzzle.translation && <p className="mt-2 text-sm italic text-ink/70">{puzzle.translation}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {options.map((o, i) => {
            const isWrong = wrong.includes(o.form);
            const isRight = solved && o.correct;
            const label = TENSE_LABEL[o.type];
            return (
              <button
                key={o.form}
                lang="es"
                disabled={solved || isWrong}
                onClick={() => onChoose(o)}
                className={`option ${isWrong ? "option-wrong" : ""} ${isRight ? "option-right" : ""}`}
                style={isRight ? { background: label.color } : undefined}
              >
                <span className="absolute left-2 top-1 text-[10px] font-bold text-ink/40">{i + 1}</span>
                <span className="block text-xl font-bold">{o.form}</span>
                {answered && (
                  <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider opacity-80">{label.es}</span>
                )}
              </button>
            );
          })}
        </div>

        {!solved && wrong.length > 0 && (
          <div role="alert" className="mt-4 rounded-md border-2 border-ink bg-[var(--preterite-soft)] p-3 text-sm leading-relaxed">
            <strong className="mr-1">Not quite: the memory stays locked.</strong>
            {puzzle.rule_feedback}
          </div>
        )}

        {solved && correct && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong style={{ color: TENSE_LABEL[correct.type].color }}>✓ {TENSE_LABEL[correct.type].es}</strong>
              <span className="text-ink/70">
                {" "}
                · {correct.type === "imperfect" ? "the scene comes alive in a loop" : "a one-time event changes the room"}
              </span>
            </p>
            <button autoFocus onClick={onClose} className="btn">
              Watch it happen →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
