"use client";

import dynamic from "next/dynamic";

const Typewriter = dynamic(
  () => import("typewriter-effect").then((mod) => mod.default),
  { ssr: false }
);

export function TypewriterValue({
  text,
  delayMs = 0,
  speed = 32,
  cursor = "",
  className,
  streamKey = 0,
  instant = false,
}) {
  const value = String(text ?? "");
  if (instant) {
    return <span className={className}>{value}</span>;
  }
  return (
    <span className={className} style={{ display: "inline-block" }}>
      <Typewriter
        key={`${streamKey}:${value}:${delayMs}`}
        options={{
          delay: speed,
          cursor,
          cursorClassName: cursor ? "ct-tw-cursor" : "ct-tw-cursor-hidden",
          wrapperClassName: "ct-tw-wrapper",
        }}
        onInit={(typewriter) => {
          typewriter.pauseFor(delayMs).typeString(value).start();
        }}
      />
    </span>
  );
}

export function TypewriterFeed({ strings, streamKey = 0 }) {
  const list = (strings || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <Typewriter
      key={`feed:${streamKey}:${list.join("|")}`}
      options={{
        strings: list,
        autoStart: true,
        loop: true,
        delay: 26,
        deleteSpeed: 14,
        pauseFor: 1600,
        cursor: "▌",
        cursorClassName: "ct-tw-cursor",
        wrapperClassName: "ct-tw-wrapper",
      }}
    />
  );
}

export function LiveFeedBar({ strings, streamKey = 0 }) {
  return (
    <div className="ct-live-feed" aria-live="polite">
      <span className="ct-live-dot" aria-hidden="true" />
      <span className="ct-live-label">LIVE</span>
      <TypewriterFeed strings={strings} streamKey={streamKey} />
    </div>
  );
}
