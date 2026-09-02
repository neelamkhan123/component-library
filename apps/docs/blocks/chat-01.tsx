"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, RotateCcw, Sparkles } from "lucide-react";
import {
  Attachment,
  Avatar,
  AvatarFallback,
  Badge,
  Bubble,
  Button,
  Composer,
  Message,
  TypingIndicator,
} from "neelam-ui";

interface Turn {
  id: number;
  from: "user" | "assistant";
  text: string;
  time: string;
}

const openingTurns: Turn[] = [
  {
    id: 1,
    from: "user",
    text: "Here's last quarter's churn export. What stands out?",
    time: "09:41",
  },
  {
    id: 2,
    from: "assistant",
    text: "Churn is concentrated in accounts that never invited a second seat — 71% of cancellations came from single-seat workspaces, against 12% of the base overall.",
    time: "09:41",
  },
  {
    id: 3,
    from: "user",
    text: "Is that a change from the quarter before?",
    time: "09:43",
  },
  {
    id: 4,
    from: "assistant",
    text: "It is. The same cohort accounted for 44% of cancellations in Q1, so the concentration has roughly doubled while total churn stayed flat.",
    time: "09:43",
  },
];

const suggestions = [
  "Break it down by plan",
  "Which accounts are at risk now?",
  "Draft a summary for the team",
];

export default function Chat01() {
  const [turns, setTurns] = useState(openingTurns);
  const [thinking, setThinking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Scroll the log itself rather than calling scrollIntoView on the last
  // turn: that walks up the tree and scrolls every ancestor with it, which
  // drags the whole page around when the chat is embedded in one.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({
      top: log.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [turns, thinking]);

  function send(text: string) {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTurns((current) => [
      ...current,
      { id: Date.now(), from: "user", text, time },
    ]);
    setThinking(true);

    // Stands in for the streamed response a real assistant would send back.
    setTimeout(() => {
      setThinking(false);
      setTurns((current) => [
        ...current,
        {
          id: Date.now(),
          from: "assistant",
          text: "Working from the same export: the single-seat cohort also has the lowest activation rate, so the two are likely the same story rather than two separate ones.",
          time,
        },
      ]);
    }, 1600);
  }

  return (
    // The panel is capped at a readable measure, so it takes side borders
    // once the window is wider than it is — otherwise it floats in the middle
    // of the page with nothing marking where it ends.
    <div className="mx-auto flex h-full min-h-[36rem] w-full max-w-2xl flex-col overflow-hidden border-slate-200 sm:border-x dark:border-slate-800">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            Revenue assistant
          </h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            Reading churn-q2.csv
          </p>
        </div>
        <Badge variant="secondary">Beta</Badge>
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={() => {
            setTurns(openingTurns);
            setThinking(false);
          }}
        >
          Reset
        </Button>
      </header>

      {/* The log is a live region so replies arriving after the fact are
          announced, rather than silently appearing below the composer. */}
      <div
        ref={logRef}
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
      >
        {turns.map((turn, index) =>
          turn.from === "user" ? (
            // No avatar on your own turns, as most chat UIs do.
            <Message key={turn.id} variant="outgoing" timestamp={turn.time}>
              <Bubble variant="outgoing">{turn.text}</Bubble>
              {index === 0 ? (
                <Attachment name="churn-q2.csv" size="86 KB" url="#" />
              ) : null}
            </Message>
          ) : (
            <Message
              key={turn.id}
              avatar={
                <Avatar size="sm">
                  <AvatarFallback>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
              }
              sender="Revenue assistant"
              timestamp={turn.time}
            >
              <Bubble>{turn.text}</Bubble>
            </Message>
          ),
        )}

        {/* Sits exactly where the next incoming Bubble will land. */}
        {thinking ? <TypingIndicator label="Assistant is replying…" /> : null}
      </div>

      <div className="shrink-0 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              size="sm"
              variant="outline"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Uncontrolled, so the field clears itself after each send. */}
        <Composer
          aria-label="Message the assistant"
          placeholder="Ask about the export… (Enter to send, Shift+Enter for a newline)"
          onSubmit={send}
        />
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Answers are generated and can be wrong. Check anything you act on.
        </p>
      </div>
    </div>
  );
}
