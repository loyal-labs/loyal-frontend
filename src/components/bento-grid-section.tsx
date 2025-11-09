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
  const [stage, setStage] = useState<"incoming" | "processing" | "complete">(
    "incoming"
  );
  const CYCLE_DURATION = 4000;
  const INCOMING_DURATION = 1000;
  const PROCESSING_DURATION = 1500;

  useEffect(() => {
    const sequence = async () => {
      setStage("incoming");
      await new Promise((resolve) => setTimeout(resolve, INCOMING_DURATION));
      setStage("processing");
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_DURATION));
      setStage("complete");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          CYCLE_DURATION - INCOMING_DURATION - PROCESSING_DURATION
        )
      );
    };

    sequence();
    const interval = setInterval(sequence, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 items-center justify-between gap-3 bg-dot-white/[0.2] p-3">
      {/* Left side - incoming documents/messages */}
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            animate={{
              x: stage === "incoming" ? 0 : stage === "processing" ? 20 : 40,
              opacity:
                stage === "incoming" ? 1 : stage === "processing" ? 0.3 : 0,
              scale:
                stage === "incoming" ? 1 : stage === "processing" ? 0.8 : 0.6,
            }}
            className="flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900/50 px-2 py-1"
            key={`doc-${index}`}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="h-3 w-3 shrink-0 rounded bg-neutral-600" />
            <div className="h-1 w-8 rounded-full bg-neutral-700" />
          </motion.div>
        ))}
      </div>

      {/* Center - shield with lock (processing) */}
      <motion.div
        animate={{
          scale: stage === "processing" ? [1, 1.2, 1] : 1,
          opacity: stage === "processing" ? 1 : 0.4,
        }}
        className="relative flex h-16 w-16 items-center justify-center"
        transition={{ duration: 0.6 }}
      >
        {/* Shield glow */}
        <motion.div
          animate={{
            opacity: stage === "processing" ? [0.3, 0.6, 0.3] : 0.1,
          }}
          className="absolute inset-0 rounded-full bg-neutral-500/20 blur-lg"
          transition={{
            duration: 1,
            repeat: stage === "processing" ? Number.POSITIVE_INFINITY : 0,
            repeatType: "loop",
          }}
        />

        {/* Shield icon */}
        <svg
          className="relative z-10 h-12 w-12 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2L4 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Lock icon in center */}
        <motion.div
          animate={{
            scale: stage === "processing" ? 1 : 0.7,
            opacity: stage === "processing" ? 1 : 0.5,
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          transition={{ duration: 0.4 }}
        >
          <IconLock className="h-5 w-5 text-neutral-300" />
        </motion.div>
      </motion.div>

      {/* Right side - processed output */}
      <div className="flex flex-col gap-2">
        <motion.div
          animate={{
            x: stage === "complete" ? 0 : -20,
            opacity: stage === "complete" ? 1 : 0,
            scale: stage === "complete" ? 1 : 0.8,
          }}
          className="flex items-center gap-1.5 rounded border border-neutral-600 bg-neutral-800/50 px-2 py-1.5"
          transition={{ duration: 0.5 }}
        >
          <svg
            className="h-3 w-3 shrink-0 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="h-1 w-10 rounded-full bg-neutral-600" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const SkeletonTwo = () => {
  const [txState, setTxState] = useState<
    "idle" | "encrypting" | "transmitting" | "complete"
  >("idle");
  const CYCLE_DURATION = 5000;
  const ENCRYPTING_DURATION = 800;
  const TRANSMITTING_DURATION = 1200;
  const COMPLETE_DURATION = 1000;

  useEffect(() => {
    const sequence = async () => {
      setTxState("idle");
      await new Promise((resolve) =>
        setTimeout(resolve, CYCLE_DURATION - ENCRYPTING_DURATION - TRANSMITTING_DURATION - COMPLETE_DURATION)
      );
      setTxState("encrypting");
      await new Promise((resolve) =>
        setTimeout(resolve, ENCRYPTING_DURATION)
      );
      setTxState("transmitting");
      await new Promise((resolve) =>
        setTimeout(resolve, TRANSMITTING_DURATION)
      );
      setTxState("complete");
      await new Promise((resolve) =>
        setTimeout(resolve, COMPLETE_DURATION)
      );
    };

    sequence();
    const interval = setInterval(sequence, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 items-center justify-between gap-4 bg-dot-white/[0.2] p-4">
      {/* Left - Sender wallet */}
      <motion.div
        animate={{
          scale: txState === "idle" || txState === "encrypting" ? 1 : 0.9,
          opacity: txState === "idle" || txState === "encrypting" ? 1 : 0.5,
        }}
        className="flex flex-col items-center gap-2"
        transition={{ duration: 0.4 }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900">
          <svg
            className="h-6 w-6 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-mono text-[10px] text-neutral-500">Wallet</span>
      </motion.div>

      {/* Center - Privacy shield with encrypted data flow */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Encrypted data packet traveling */}
        <motion.div
          animate={{
            x:
              txState === "idle"
                ? "-100%"
                : txState === "encrypting"
                  ? "-50%"
                  : txState === "transmitting"
                    ? "50%"
                    : "100%",
            opacity:
              txState === "idle" || txState === "complete" ? 0 : 1,
          }}
          className="absolute"
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900/80 px-2 py-1 backdrop-blur-sm">
            <IconLock className="h-3 w-3 text-neutral-500" />
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={`dot-${i}`}
                  className="h-1 w-1 rounded-full bg-neutral-600"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Center shield */}
        <motion.div
          animate={{
            scale: txState === "encrypting" ? [1, 1.15, 1] : 1,
            opacity: txState === "encrypting" || txState === "transmitting" ? 1 : 0.3,
          }}
          className="relative"
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              opacity: txState === "encrypting" ? [0.2, 0.4, 0.2] : 0.1,
            }}
            className="absolute inset-0 rounded-full bg-neutral-500/10 blur-md"
            transition={{
              duration: 0.8,
              repeat: txState === "encrypting" ? Number.POSITIVE_INFINITY : 0,
              repeatType: "loop",
            }}
          />
          <svg
            className="h-10 w-10 text-neutral-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* "No trace" indicator */}
        <motion.div
          animate={{
            opacity: txState === "transmitting" ? 1 : 0,
            y: txState === "transmitting" ? 0 : 10,
          }}
          className="absolute -bottom-2 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5"
          transition={{ duration: 0.3 }}
        >
          <span className="font-mono text-[9px] text-neutral-500">
            No trace
          </span>
        </motion.div>
      </div>

      {/* Right - Receiver */}
      <motion.div
        animate={{
          scale: txState === "complete" ? [1, 1.1, 1] : txState === "transmitting" ? 1 : 0.9,
          opacity: txState === "complete" || txState === "transmitting" ? 1 : 0.5,
        }}
        className="flex flex-col items-center gap-2"
        transition={{ duration: 0.4 }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900">
          <svg
            className="h-6 w-6 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Success pulse */}
          {txState === "complete" && (
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              className="absolute inset-0 rounded-lg border border-neutral-600"
              transition={{ duration: 0.6 }}
            />
          )}
        </div>
        <span className="font-mono text-[10px] text-neutral-500">
          Complete
        </span>
      </motion.div>
    </motion.div>
  );
};

const SkeletonThree = () => {
  const [activeTask, setActiveTask] = useState(0);
  const TASK_DURATION = 1200;
  const TOTAL_TASKS = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTask((prev) => (prev + 1) % TOTAL_TASKS);
    }, TASK_DURATION);
    return () => clearInterval(interval);
  }, []);

  const tasks = [
    { icon: "wallet", label: "Transfer" },
    { icon: "repeat", label: "Schedule" },
    { icon: "check", label: "Execute" },
  ];

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 flex-col justify-center gap-3 bg-dot-white/[0.2] p-4">
      {/* Automation engine indicator */}
      <div className="flex items-center justify-center gap-2">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900"
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <svg
            className="h-4 w-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-1.06 4.46m-1.039-7.877l.548-2.937M18.5 12l-1.5.667M6.5 12l-1.5-.667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <span className="font-mono text-[10px] text-neutral-500">
          Auto Engine
        </span>
      </div>

      {/* Task workflow */}
      <div className="flex items-center justify-between gap-2">
        {tasks.map((task, index) => {
          const isActive = activeTask === index;
          const isCompleted = index < activeTask;

          return (
            <div key={task.label} className="flex flex-1 flex-col items-center gap-1.5">
              {/* Task node */}
              <motion.div
                animate={{
                  scale: isActive ? [1, 1.15, 1] : 1,
                  borderColor: isActive
                    ? "rgb(115, 115, 115)"
                    : isCompleted
                      ? "rgb(82, 82, 82)"
                      : "rgb(64, 64, 64)",
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg border bg-neutral-900"
                transition={{ duration: 0.5 }}
              >
                {task.icon === "wallet" && (
                  <svg
                    className="h-5 w-5 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {task.icon === "repeat" && (
                  <svg
                    className="h-5 w-5 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {task.icon === "check" && (
                  <motion.svg
                    animate={{
                      scale: isCompleted ? 1 : 0.8,
                      opacity: isCompleted ? 1 : 0.5,
                    }}
                    className="h-5 w-5 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    transition={{ duration: 0.3 }}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}

                {/* Active pulse */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    className="absolute inset-0 rounded-lg border border-neutral-600"
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                )}
              </motion.div>

              {/* Task label */}
              <span
                className={`font-mono text-[9px] ${isActive ? "text-neutral-400" : "text-neutral-600"}`}
              >
                {task.label}
              </span>

              {/* Connection line to next task */}
              {index < tasks.length - 1 && (
                <div className="absolute left-[calc(33.33%+1.25rem)] top-[2.5rem] h-0.5 w-[calc(33.33%-2.5rem)] bg-neutral-800">
                  <motion.div
                    animate={{
                      scaleX: index < activeTask ? 1 : 0,
                    }}
                    className="h-full origin-left bg-neutral-600"
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const SkeletonFour = () => {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const TASK_COMPLETION_INTERVAL = 1500;
  const TOTAL_TASKS = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTask((prev) => {
        const next = (prev + 1) % TOTAL_TASKS;
        if (next === 0) {
          setCompletedTasks([]);
        } else {
          setCompletedTasks((completed) => [...completed, prev]);
        }
        return next;
      });
    }, TASK_COMPLETION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const tasks = [
    { icon: "invoice", label: "Invoice" },
    { icon: "payment", label: "Payment" },
    { icon: "transfer", label: "Transfer" },
  ];

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 items-center justify-between gap-4 bg-dot-white/[0.2] p-4">
      {/* Left - Task queue */}
      <div className="flex flex-col gap-2">
        {tasks.map((task, index) => {
          const isCompleted = completedTasks.includes(index);
          const isCurrent = currentTask === index;

          return (
            <motion.div
              key={task.label}
              animate={{
                opacity: isCompleted ? 0.3 : 1,
                x: isCompleted ? 10 : 0,
                scale: isCurrent ? 1.05 : 1,
              }}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              transition={{ duration: 0.3 }}
            >
              {/* Task icon */}
              <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-800">
                {task.icon === "invoice" && (
                  <svg
                    className="h-4 w-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {task.icon === "payment" && (
                  <svg
                    className="h-4 w-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {task.icon === "transfer" && (
                  <svg
                    className="h-4 w-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Task label */}
              <span className="font-mono text-[10px] text-neutral-400">
                {task.label}
              </span>

              {/* Checkmark when completed */}
              {isCompleted && (
                <motion.svg
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1] }}
                  className="ml-auto h-3 w-3 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  transition={{ duration: 0.3 }}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Center - Automation indicator */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        className="flex flex-col items-center gap-2"
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      >
        {/* Robot/automation hand icon */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900">
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            className="absolute inset-0 rounded-full bg-neutral-600/10 blur-lg"
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />
          <svg
            className="relative z-10 h-7 w-7 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-mono text-[9px] text-neutral-500">
          Auto-pilot
        </span>
      </motion.div>

      {/* Right - Completed indicator */}
      <motion.div
        animate={{
          scale: completedTasks.length === TOTAL_TASKS ? [1, 1.15, 1] : 1,
          opacity: completedTasks.length > 0 ? 1 : 0.3,
        }}
        className="flex flex-col items-center gap-2"
        transition={{ duration: 0.5 }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900">
          <svg
            className="h-6 w-6 text-neutral-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {completedTasks.length === TOTAL_TASKS && (
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              className="absolute inset-0 rounded-lg border-2 border-neutral-600"
              transition={{ duration: 0.8 }}
            />
          )}
        </div>
        <span className="font-mono text-[9px] text-neutral-500">Done</span>
      </motion.div>
    </motion.div>
  );
};

const SkeletonFiveApp = () => {
  const [dataIndex, setDataIndex] = useState(0);
  const DATA_CYCLE_INTERVAL = 1800;
  const TOTAL_DATA_ITEMS = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setDataIndex((prev) => (prev + 1) % TOTAL_DATA_ITEMS);
    }, DATA_CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const dataItems = [
    { label: "Messages", icon: "message" },
    { label: "Files", icon: "file" },
    { label: "Keys", icon: "key" },
    { label: "Tokens", icon: "coin" },
  ];

  return (
    <motion.div className="flex h-full min-h-[6rem] w-full flex-1 flex-col items-center justify-center gap-3 bg-dot-white/[0.2] p-4">
      {/* Center - Wallet as storage */}
      <div className="relative flex flex-col items-center">
        {/* Wallet container */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          className="relative flex h-20 w-20 items-center justify-center rounded-xl border-2 border-neutral-600/40 bg-neutral-800/50"
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        >
          {/* Wallet glow */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            className="absolute inset-0 rounded-xl bg-neutral-500/10 blur-lg"
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />

          {/* Wallet icon */}
          <svg
            className="relative z-10 h-10 w-10 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Data items flowing into wallet - positioned around it */}
          {dataItems.map((item, index) => {
            const isActive = dataIndex === index;
            // Position items in a circle around the wallet
            const angle = (index / TOTAL_DATA_ITEMS) * 2 * Math.PI - Math.PI / 2;
            const radius = 50;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                animate={{
                  opacity: isActive ? [0, 1, 0.7, 0] : 0.2,
                  scale: isActive ? [0.8, 1, 1, 0.8] : 0.8,
                  x: isActive ? [x, 0] : x,
                  y: isActive ? [y, 0] : y,
                }}
                className="absolute flex items-center gap-1 rounded border border-neutral-700 bg-neutral-900/80 px-2 py-0.5"
                key={`data-${index}`}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                {item.icon === "message" && (
                  <svg
                    className="h-3 w-3 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {item.icon === "file" && (
                  <svg
                    className="h-3 w-3 text-neutral-500"
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
                )}
                {item.icon === "key" && (
                  <svg
                    className="h-3 w-3 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {item.icon === "coin" && (
                  <svg
                    className="h-3 w-3 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <span className="font-mono text-[9px] text-neutral-500">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Label below */}
        <span className="mt-2 text-center font-mono text-[10px] text-neutral-400">
          Your wallet = your data
        </span>
      </div>
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
    { color: "from-neutral-500 to-neutral-600", yPercent: 15 },
    { color: "from-neutral-500 to-neutral-600", yPercent: 50 },
    { color: "from-neutral-500 to-neutral-600", yPercent: 85 },
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
                      ? "#a3a3a3"
                      : index === 1
                        ? "#a3a3a3"
                        : "#a3a3a3"
                  }
                />
                <stop offset="100%" stopColor="#737373" />
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
                        ? "#a3a3a3"
                        : index === 1
                          ? "#a3a3a3"
                          : "#a3a3a3"
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
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-400/20 to-neutral-500/20 blur-xl"
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-neutral-600/40 bg-neutral-700/10 shadow-lg">
          <svg
            className="h-8 w-8 text-neutral-400"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-neutral-600/40 bg-neutral-700/10">
            <IconMessage className="h-6 w-6 text-neutral-400" />
          </div>
          <span className="font-mono text-[10px] text-neutral-400">Input</span>
        </motion.div>

        {/* Flow line 1 */}
        <div className="relative h-0.5 flex-1 bg-neutral-700">
          <motion.div
            animate={{
              scaleX: activeStep >= 1 ? 1 : 0,
            }}
            className="absolute inset-0 origin-left bg-gradient-to-r from-neutral-500 to-neutral-600"
            transition={{ duration: 0.6 }}
          />
          {/* Flowing particle */}
          {activeStep === 0 && (
            <motion.div
              animate={{ x: ["0%", "100%"] }}
              className="-translate-y-1/2 absolute top-1/2 h-2 w-2 rounded-full bg-neutral-500 shadow-lg"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-neutral-600/40 bg-neutral-700/10">
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
              <IconTableColumn className="h-6 w-6 text-neutral-400" />
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
            className="absolute inset-0 origin-left bg-gradient-to-r from-neutral-500 to-neutral-600"
            transition={{ duration: 0.6 }}
          />
          {/* Flowing particle */}
          {activeStep === 1 && (
            <motion.div
              animate={{ x: ["0%", "100%"] }}
              className="-translate-y-1/2 absolute top-1/2 h-2 w-2 rounded-full bg-neutral-500 shadow-lg"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-neutral-600/40 bg-neutral-700/10">
            <motion.div
              animate={{
                scale: activeStep === 2 ? [0, 1] : 1,
                rotate: activeStep === 2 ? [0, 360] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="h-6 w-6 text-neutral-400"
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
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600" />
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[11px] text-neutral-400">@alice</span>
          <div className="rounded-2xl rounded-tl-sm border border-neutral-600/30 bg-neutral-700/10 px-2.5 py-1.5">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-500 via-neutral-600 to-neutral-700 shadow-lg">
              <span className="font-bold text-white text-xs">5</span>
            </div>
            {/* Privacy particles/shimmer */}
            <motion.div
              animate={{
                opacity: stage === "sending" ? [0.3, 0.8, 0.3] : 0,
                scale: stage === "sending" ? [1, 1.5, 1] : 1,
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-400/30 to-neutral-500/30 blur-md"
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
          className="flex items-center gap-1 rounded-full border border-neutral-600/40 bg-neutral-700/10 px-2 py-0.5"
          transition={{ duration: 0.3 }}
        >
          <IconLock className="h-3 w-3 text-neutral-400" />
          <span className="font-mono text-[10px] text-neutral-400">
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
          <div className="rounded-2xl rounded-tr-sm border border-neutral-600/30 bg-neutral-700/10 px-2.5 py-1.5">
            <span className="text-neutral-300 text-xs">Received 5 SOL</span>
          </div>
        </div>
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600" />
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
          className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-400/20 to-neutral-500/20 blur-xl"
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
                <stop offset="0%" stopColor="rgb(163, 163, 163)" />
                <stop offset="100%" stopColor="rgb(115, 115, 115)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Lock icon in center */}
          <motion.div
            animate={{
              scale: isSecured ? 1 : 0.7,
              opacity: isSecured ? 1 : 0.4,
            }}
            className="z-20 text-neutral-400"
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
              className="absolute h-2 w-2 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500"
              key={`particle-${index}`}
              style={{
                boxShadow: isSecured
                  ? "0 0 8px rgba(163, 163, 163, 0.4)"
                  : "0 0 4px rgba(163, 163, 163, 0.2)",
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neutral-400 via-neutral-500 to-neutral-600 shadow-lg"
            key={`coin-${index}`}
            transition={{
              delay: index * COIN_DELAY_PER_INDEX,
              duration: COIN_ANIMATION_DURATION,
            }}
          >
            <div className="h-5 w-5 rounded-full border-2 border-neutral-300/40" />
          </motion.div>
        ))}
      </div>

      {/* Payment amount display */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between rounded-lg border border-neutral-700 bg-neutral-900/50 px-3 py-2">
          <span className="font-mono text-neutral-400 text-xs">Query</span>
          <motion.span
            animate={{ scale: [1, PRICE_SCALE_MAX, 1] }}
            className="font-mono font-semibold text-neutral-300"
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
                className="h-full origin-left bg-gradient-to-r from-neutral-400 to-neutral-500"
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
  cardFiveApp: {
    header: <SkeletonFiveApp />,
    className: "md:col-span-1",
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
