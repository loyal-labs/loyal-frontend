"use client";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconCoin,
  IconFileBroken,
  IconGitBranch,
  IconLock,
  IconMessage,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import localFont from "next/font/local";
import { memo, type ReactNode, useEffect, useRef, useState } from "react";
import { type BentoItemVisualKey, bentoTabs } from "@/data/bento";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import { Spotlight } from "./ui/spotlight-new";

const instrumentSerif = localFont({
  src: [
    {
      path: "../../public/fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
});

function BentoGridSectionComponent() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const getIndicatorStyle = () => {
    const index = hoveredTab !== null ? hoveredTab : activeTab;
    const tab = tabRefs.current[index];
    if (!tab) return { left: 0, width: 0, opacity: 0 };

    return {
      left: tab.offsetLeft,
      width: tab.offsetWidth,
      opacity: 1,
    };
  };

  return (
    <section
      id="about-section"
      style={{
        position: "relative",
        padding: "4rem 1rem",
        background: "#000",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
      }}
    >
      <Spotlight />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h2
          className={instrumentSerif.className}
          style={{
            fontSize: "3.5rem",
            fontWeight: 400,
            color: "#fff",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          About Loyal
        </h2>
        <p
          className={instrumentSerif.className}
          style={{
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
            marginBottom: "3rem",
            maxWidth: "800px",
            margin: "0 auto 3rem",
            lineHeight: 1.45,
          }}
        >
          Discover the power of private AI conversations with cutting-edge
          technology
        </p>

        {/* Tabs Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2.5rem",
          }}
        >
          <div
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              position: "relative",
              display: "inline-flex",
              gap: "0.25rem",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "0.375rem 0.5rem",
              boxShadow:
                "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Sliding indicator - shows only on hover */}
            {hoveredTab !== null && hoveredTab !== activeTab && (
              <div
                style={{
                  position: "absolute",
                  top: "0.375rem",
                  bottom: "0.375rem",
                  left: getIndicatorStyle().left,
                  width: getIndicatorStyle().width,
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}

            {/* Active tab indicator */}
            <div
              style={{
                position: "absolute",
                top: "0.375rem",
                bottom: "0.375rem",
                left: tabRefs.current[activeTab]?.offsetLeft ?? 0,
                width: tabRefs.current[activeTab]?.offsetWidth ?? 0,
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: "none",
                zIndex: 0,
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.2)",
              }}
            />

            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                onMouseEnter={() => setHoveredTab(index)}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                style={{
                  position: "relative",
                  padding: "0.375rem 1rem",
                  fontSize: "0.8125rem",
                  fontWeight: activeTab === index ? 600 : 500,
                  color:
                    activeTab === index
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.55)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  zIndex: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <BentoGrid className="mx-auto max-w-4xl md:auto-rows-[20rem]">
          {tabs[activeTab].content.map((item, i) => (
            <BentoGridItem
              className={cn("[&>p:text-lg]", item.className)}
              description={item.description}
              header={item.header}
              icon={item.icon}
              key={i}
              title={item.title}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

export const BentoGridSection = memo(BentoGridSectionComponent);

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2 bg-dot-white/[0.2]"
      initial="initial"
      whileHover="animate"
    >
      <motion.div
        className="flex flex-row items-center space-x-2 rounded-full border border-neutral-700 bg-neutral-900 p-2"
        variants={variants}
      >
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
        <div className="h-4 w-full rounded-full bg-neutral-800" />
      </motion.div>
      <motion.div
        className="ml-auto flex w-3/4 flex-row items-center space-x-2 rounded-full border border-neutral-700 bg-neutral-900 p-2"
        variants={variantsSecond}
      >
        <div className="h-4 w-full rounded-full bg-neutral-800" />
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
      </motion.div>
      <motion.div
        className="flex flex-row items-center space-x-2 rounded-full border border-neutral-700 bg-neutral-900 p-2"
        variants={variants}
      >
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
        <div className="h-4 w-full rounded-full bg-neutral-800" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: "100%",
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ["0%", "100%"],
      transition: {
        duration: 2,
      },
    },
  };
  const widths = [82, 64, 75, 90, 68, 58];
  return (
    <motion.div
      animate="animate"
      className="flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2 bg-dot-white/[0.2]"
      initial="initial"
      whileHover="hover"
    >
      {widths.map((width, i) => (
        <motion.div
          className="flex h-4 w-full flex-row items-center space-x-2 rounded-full border border-neutral-700 bg-neutral-900 p-2"
          key={"skelenton-two" + i}
          style={{
            maxWidth: `${width}%`,
          }}
          variants={variants}
        />
      ))}
    </motion.div>
  );
};

const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      animate="animate"
      className="flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2 rounded-lg bg-dot-white/[0.2]"
      initial="initial"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}
      transition={{
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
      variants={variants}
    >
      <motion.div className="h-full w-full rounded-lg" />
    </motion.div>
  );
};

const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      animate="animate"
      className="flex h-full min-h-[6rem] w-full flex-1 flex-row space-x-2 bg-dot-white/[0.2]"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className="flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 p-4"
        variants={first}
      >
        <img
          alt="avatar"
          className="h-10 w-10 rounded-full"
          height="100"
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          width="100"
        />
        <p className="mt-4 text-center font-semibold text-neutral-300 text-xs sm:text-sm">
          Just code in Vanilla Javascript
        </p>
        <p className="mt-4 rounded-full border border-red-500 bg-red-900/20 px-2 py-0.5 text-red-400 text-xs">
          Delusional
        </p>
      </motion.div>
      <motion.div className="relative z-20 flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
        <img
          alt="avatar"
          className="h-10 w-10 rounded-full"
          height="100"
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          width="100"
        />
        <p className="mt-4 text-center font-semibold text-neutral-300 text-xs sm:text-sm">
          Tailwind CSS is cool, you know
        </p>
        <p className="mt-4 rounded-full border border-green-500 bg-green-900/20 px-2 py-0.5 text-green-400 text-xs">
          Sensible
        </p>
      </motion.div>
      <motion.div
        className="flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 p-4"
        variants={second}
      >
        <img
          alt="avatar"
          className="h-10 w-10 rounded-full"
          height="100"
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          width="100"
        />
        <p className="mt-4 text-center font-semibold text-neutral-300 text-xs sm:text-sm">
          I love angular, RSC, and Redux.
        </p>
        <p className="mt-4 rounded-full border border-orange-500 bg-orange-900/20 px-2 py-0.5 text-orange-400 text-xs">
          Helpless
        </p>
      </motion.div>
    </motion.div>
  );
};

const SkeletonFive = () => {
  const [activeConnection, setActiveConnection] = useState(0);
  const CONNECTION_INTERVAL = 2000;
  const NUM_CONTRACTS = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnection((prev) => (prev + 1) % NUM_CONTRACTS);
    }, CONNECTION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const contracts = [
    { color: "from-purple-400 to-purple-600", yPercent: 15 },
    { color: "from-blue-400 to-blue-600", yPercent: 50 },
    { color: "from-cyan-400 to-cyan-600", yPercent: 85 },
  ];

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 items-center justify-between gap-4 bg-dot-white/[0.2] p-4">
      {/* Left side - Smart Contracts */}
      <div className="flex flex-col justify-center gap-5">
        {contracts.map((contract, index) => (
          <motion.div
            animate={{
              scale: activeConnection === index ? 1.1 : 1,
              opacity: activeConnection === index ? 1 : 0.5,
            }}
            className="flex items-center gap-2"
            key={`contract-${index}`}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${contract.color} shadow-lg`}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {activeConnection === index && (
              <motion.span
                animate={{ opacity: [0, 1] }}
                className="font-mono text-[10px] text-neutral-400"
                transition={{ duration: 0.3 }}
              >
                Contract {index + 1}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Connection Lines with flowing particles */}
      <div className="relative flex-1 self-stretch">
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            {contracts.map((_, index) => (
              <linearGradient
                id={`gradient-${index}`}
                key={`gradient-${index}`}
                x1="0%"
                x2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={
                    index === 0
                      ? "#a78bfa"
                      : index === 1
                        ? "#60a5fa"
                        : "#22d3ee"
                  }
                />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            ))}
          </defs>
          {contracts.map((contract, index) => {
            const isActive = activeConnection === index;
            const startY = 15 + index * 35; // 15, 50, 85
            // For middle line, adjust control point to create visible curve
            const controlY = index === 1 ? startY - 5 : startY;
            return (
              <g key={`line-${index}`}>
                {/* Connection line */}
                <path
                  d={`M 0 ${startY} Q 50 ${controlY} 100 50`}
                  fill="none"
                  opacity={isActive ? 1 : 0.4}
                  stroke={`url(#gradient-${index})`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {/* Flowing particle */}
                {isActive && (
                  <circle
                    fill={
                      index === 0
                        ? "#a78bfa"
                        : index === 1
                          ? "#60a5fa"
                          : "#22d3ee"
                    }
                    r="2.5"
                  >
                    <animateMotion
                      dur="1.5s"
                      path={`M 0 ${startY} Q 50 ${controlY} 100 50`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right side - AI Agent */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        className="relative"
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      >
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-green-400/30 blur-xl"
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 shadow-lg">
          <svg
            className="h-8 w-8 text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="mt-1 block text-center font-mono text-[10px] text-neutral-400">
          Loyal Agent
        </span>
      </motion.div>
    </motion.div>
  );
};

const SkeletonNine = () => {
  const [activeStep, setActiveStep] = useState(0);
  const CYCLE_INTERVAL = 2500;
  const TOTAL_STEPS = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TOTAL_STEPS);
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 items-center justify-center bg-dot-white/[0.2] p-4">
      <div className="flex w-full items-center justify-between gap-2">
        {/* Input Node */}
        <motion.div
          animate={{
            scale: activeStep === 0 ? [1, 1.1, 1] : 1,
          }}
          className="flex flex-col items-center gap-1.5"
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
            <IconMessage className="h-6 w-6 text-blue-400" />
          </div>
          <span className="font-mono text-[10px] text-neutral-400">Input</span>
        </motion.div>

        {/* Flow line 1 */}
        <div className="relative h-0.5 flex-1 bg-neutral-700">
          <motion.div
            animate={{
              scaleX: activeStep >= 1 ? 1 : 0,
            }}
            className="absolute inset-0 origin-left bg-gradient-to-r from-blue-400 to-purple-400"
            transition={{ duration: 0.6 }}
          />
          {/* Flowing particle */}
          {activeStep === 0 && (
            <motion.div
              animate={{ x: ["0%", "100%"] }}
              className="-translate-y-1/2 absolute top-1/2 h-2 w-2 rounded-full bg-blue-400 shadow-lg"
              transition={{ duration: 0.8, ease: "linear" }}
            />
          )}
        </div>

        {/* Process Node */}
        <motion.div
          animate={{
            scale: activeStep === 1 ? [1, 1.1, 1] : 1,
          }}
          className="flex flex-col items-center gap-1.5"
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-purple-500/40 bg-purple-500/10">
            <motion.div
              animate={{
                rotate: activeStep === 1 ? 360 : 0,
              }}
              transition={{
                duration: 1,
                ease: "linear",
                repeat: activeStep === 1 ? Number.POSITIVE_INFINITY : 0,
              }}
            >
              <IconTableColumn className="h-6 w-6 text-purple-400" />
            </motion.div>
          </div>
          <span className="font-mono text-[10px] text-neutral-400">
            Process
          </span>
        </motion.div>

        {/* Flow line 2 */}
        <div className="relative h-0.5 flex-1 bg-neutral-700">
          <motion.div
            animate={{
              scaleX: activeStep >= 2 ? 1 : 0,
            }}
            className="absolute inset-0 origin-left bg-gradient-to-r from-purple-400 to-emerald-400"
            transition={{ duration: 0.6 }}
          />
          {/* Flowing particle */}
          {activeStep === 1 && (
            <motion.div
              animate={{ x: ["0%", "100%"] }}
              className="-translate-y-1/2 absolute top-1/2 h-2 w-2 rounded-full bg-purple-400 shadow-lg"
              transition={{ duration: 0.8, ease: "linear" }}
            />
          )}
        </div>

        {/* Output Node */}
        <motion.div
          animate={{
            scale: activeStep === 2 ? [1, 1.1, 1] : 1,
          }}
          className="flex flex-col items-center gap-1.5"
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-emerald-500/40 bg-emerald-500/10">
            <motion.div
              animate={{
                scale: activeStep === 2 ? [0, 1] : 1,
                rotate: activeStep === 2 ? [0, 360] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="h-6 w-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
          <span className="font-mono text-[10px] text-neutral-400">Done</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

const SkeletonEight = () => {
  const [stage, setStage] = useState<"idle" | "sending" | "sent">("idle");
  const CYCLE_DURATION = 4000;
  const IDLE_DURATION = 1000;
  const SENDING_DURATION = 1500;

  useEffect(() => {
    const sequence = async () => {
      setStage("idle");
      await new Promise((resolve) => setTimeout(resolve, IDLE_DURATION));
      setStage("sending");
      await new Promise((resolve) => setTimeout(resolve, SENDING_DURATION));
      setStage("sent");
      await new Promise((resolve) =>
        setTimeout(resolve, CYCLE_DURATION - IDLE_DURATION - SENDING_DURATION)
      );
    };

    sequence();
    const interval = setInterval(sequence, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 flex-col justify-between bg-dot-white/[0.2] px-4 pt-4 pb-3">
      {/* Sender bubble */}
      <motion.div
        animate={{
          opacity: stage === "idle" ? 0 : 1,
          y: stage === "idle" ? -10 : 0,
        }}
        className="flex items-start gap-2"
        transition={{ duration: 0.4 }}
      >
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[11px] text-neutral-400">@alice</span>
          <div className="rounded-2xl rounded-tl-sm border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5">
            <span className="text-neutral-300 text-xs">Send 5 SOL</span>
          </div>
        </div>
      </motion.div>

      {/* Animated coin/token traveling */}
      <div className="relative flex h-8 items-center justify-center">
        <motion.div
          animate={{
            x: stage === "idle" ? -60 : stage === "sending" ? 0 : 60,
            opacity: stage === "idle" || stage === "sent" ? 0 : 1,
            scale: stage === "sending" ? [1, 1.3, 1] : 1,
          }}
          className="absolute"
          transition={{
            duration: stage === "sending" ? 1 : 0.4,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <div className="relative">
            {/* Coin */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 shadow-lg">
              <span className="font-bold text-white text-xs">5</span>
            </div>
            {/* Privacy particles/shimmer */}
            <motion.div
              animate={{
                opacity: stage === "sending" ? [0.3, 0.8, 0.3] : 0,
                scale: stage === "sending" ? [1, 1.5, 1] : 1,
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/40 to-purple-400/40 blur-md"
              transition={{
                duration: 0.8,
                repeat: stage === "sending" ? Number.POSITIVE_INFINITY : 0,
                repeatType: "loop",
              }}
            />
          </div>
        </motion.div>

        {/* Privacy shield indicator */}
        <motion.div
          animate={{
            opacity: stage === "sending" ? 1 : 0,
            scale: stage === "sending" ? 1 : 0.8,
          }}
          className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5"
          transition={{ duration: 0.3 }}
        >
          <IconLock className="h-3 w-3 text-emerald-400" />
          <span className="font-mono text-[10px] text-emerald-400">
            Private
          </span>
        </motion.div>
      </div>

      {/* Receiver bubble */}
      <motion.div
        animate={{
          opacity: stage === "sent" ? 1 : 0,
          y: stage === "sent" ? 0 : 10,
        }}
        className="ml-auto flex items-start gap-2"
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[11px] text-neutral-400">@bob</span>
          <div className="rounded-2xl rounded-tr-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5">
            <span className="text-neutral-300 text-xs">Received 5 SOL</span>
          </div>
        </div>
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonSeven = () => {
  const [isSecured, setIsSecured] = useState(false);
  const CYCLE_INTERVAL = 3500;
  const PARTICLE_COUNT = 6;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSecured((prev) => !prev);
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Scattered positions form a circle around the shield
  const getScatteredPosition = (index: number) => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    const radius = 45;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <motion.div className="relative flex h-full min-h-[6rem] w-full flex-1 items-center justify-center overflow-hidden bg-dot-white/[0.2]">
      {/* Central Shield Container */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Glowing shield background */}
        <motion.div
          animate={{
            scale: isSecured ? [1, 1.15, 1] : 1,
            opacity: isSecured ? [0.4, 0.6, 0.4] : 0.2,
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 blur-xl"
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        />

        {/* Shield shape */}
        <motion.div
          animate={{
            scale: isSecured ? 1 : 0.9,
          }}
          className="relative z-10 flex h-16 w-16 items-center justify-center"
          transition={{ duration: 0.6 }}
        >
          {/* Shield border with gradient */}
          <svg
            className="absolute inset-0 h-full w-full"
            fill="none"
            viewBox="0 0 64 64"
          >
            <motion.path
              animate={{
                opacity: isSecured ? 1 : 0.5,
                pathLength: isSecured ? 1 : 0.8,
              }}
              d="M32 4 L52 12 L52 28 Q52 44 32 60 Q12 44 12 28 L12 12 Z"
              stroke="url(#shield-gradient)"
              strokeWidth="2"
              transition={{ duration: 0.8 }}
            />
            <defs>
              <linearGradient
                id="shield-gradient"
                x1="0%"
                x2="100%"
                y1="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgb(52, 211, 153)" />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Lock icon in center */}
          <motion.div
            animate={{
              scale: isSecured ? 1 : 0.7,
              opacity: isSecured ? 1 : 0.4,
            }}
            className="z-20 text-emerald-400"
            transition={{ duration: 0.5 }}
          >
            <IconLock className="h-6 w-6" />
          </motion.div>
        </motion.div>

        {/* Data particles flowing */}
        {Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
          const scattered = getScatteredPosition(index);
          return (
            <motion.div
              animate={
                isSecured
                  ? {
                      x: 0,
                      y: 0,
                      scale: 0.3,
                      opacity: 0.8,
                    }
                  : {
                      x: scattered.x,
                      y: scattered.y,
                      scale: 1,
                      opacity: 0.4,
                    }
              }
              className="absolute h-2 w-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"
              key={`particle-${index}`}
              style={{
                boxShadow: isSecured
                  ? "0 0 8px rgba(34, 211, 238, 0.6)"
                  : "0 0 4px rgba(34, 211, 238, 0.3)",
              }}
              transition={{
                duration: 1.2,
                delay: index * 0.08,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            />
          );
        })}
      </div>

      {/* Status text */}
      <motion.div
        animate={{ opacity: isSecured ? 1 : 0.6 }}
        className="-translate-x-1/2 absolute bottom-4 left-1/2 whitespace-nowrap rounded-full border border-neutral-700/50 bg-neutral-900/70 px-3 py-1 backdrop-blur-sm"
        transition={{ duration: 0.4 }}
      >
        <span className="font-mono text-neutral-300 text-xs">
          {isSecured ? "Your Data, Your Rules" : "Collecting..."}
        </span>
      </motion.div>
    </motion.div>
  );
};

const SkeletonSix = () => {
  const ANIMATION_CYCLE_LENGTH = 4;
  const ANIMATION_INTERVAL_MS = 1500;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev + 1) % ANIMATION_CYCLE_LENGTH);
    }, ANIMATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const COIN_DELAY_PER_INDEX = 0.15;
  const COIN_ANIMATION_DURATION = 0.4;
  const PRICE_SCALE_MAX = 1.2;
  const PRICE_ANIMATION_DURATION = 0.3;
  const BAR_ANIMATION_DURATION = 0.6;
  const PRICE_PER_QUERY = 0.001;

  return (
    <motion.div
      className="flex h-full min-h-[6rem] w-full flex-1 flex-col justify-between bg-dot-white/[0.2] p-2"
      initial="initial"
    >
      {/* Animated coins dropping */}
      <div className="flex flex-row items-start justify-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            animate={
              index <= count
                ? { y: 0, opacity: 1, scale: 1 }
                : { y: -20, opacity: 0, scale: 0.8 }
            }
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-lg"
            key={`coin-${index}`}
            transition={{
              delay: index * COIN_DELAY_PER_INDEX,
              duration: COIN_ANIMATION_DURATION,
            }}
          >
            <div className="h-5 w-5 rounded-full border-2 border-amber-200/40" />
          </motion.div>
        ))}
      </div>

      {/* Payment amount display */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between rounded-lg border border-neutral-700 bg-neutral-900/50 px-3 py-2">
          <span className="font-mono text-neutral-400 text-xs">Query</span>
          <motion.span
            animate={{ scale: [1, PRICE_SCALE_MAX, 1] }}
            className="font-mono font-semibold text-emerald-400"
            key={count}
            transition={{ duration: PRICE_ANIMATION_DURATION }}
          >
            ${(count + 1) * PRICE_PER_QUERY}
          </motion.span>
        </div>

        {/* Progress bars showing accumulation */}
        <div className="space-y-1.5">
          {[0.33, 0.66, 1].map((width, idx) => (
            <div
              className="h-1.5 overflow-hidden rounded-full bg-neutral-800"
              key={`bar-${idx}`}
            >
              <motion.div
                animate={idx <= count ? { scaleX: width } : { scaleX: 0 }}
                className="h-full origin-left bg-gradient-to-r from-emerald-400 to-cyan-400"
                transition={{ duration: BAR_ANIMATION_DURATION }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

type BentoVisualConfig = {
  header: ReactNode;
  className: string;
  icon: ReactNode;
};

const bentoVisuals: Record<BentoItemVisualKey, BentoVisualConfig> = {
  cardOne: {
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  cardTwo: {
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  cardThree: {
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  cardFour: {
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  cardFive: {
    header: <SkeletonFive />,
    className: "md:col-span-2",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
  },
  cardSix: {
    header: <SkeletonSix />,
    className: "md:col-span-1",
    icon: <IconCoin className="h-4 w-4 text-neutral-500" />,
  },
  cardSeven: {
    header: <SkeletonSeven />,
    className: "md:col-span-1",
    icon: <IconLock className="h-4 w-4 text-neutral-500" />,
  },
  cardEight: {
    header: <SkeletonEight />,
    className: "md:col-span-1",
    icon: <IconMessage className="h-4 w-4 text-neutral-500" />,
  },
  cardNine: {
    header: <SkeletonNine />,
    className: "md:col-span-1",
    icon: <IconGitBranch className="h-4 w-4 text-neutral-500" />,
  },
};

const tabs = bentoTabs.map((tab) => ({
  label: tab.label,
  content: tab.items.map((item) => {
    const visuals = bentoVisuals[item.visualKey];

    return {
      ...visuals,
      title: item.title,
      description: <span className="text-sm">{item.description}</span>,
    };
  }),
}));
