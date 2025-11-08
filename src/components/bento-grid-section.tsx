"use client";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import localFont from "next/font/local";
import { memo, type ReactNode, useRef, useState } from "react";
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
        className="flex flex-row items-start space-x-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-2"
        variants={variants}
      >
        <img
          alt="avatar"
          className="h-10 w-10 rounded-full"
          height="100"
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          width="100"
        />
        <p className="text-neutral-300 text-xs">
          There are a lot of cool framerworks out there like React, Angular,
          Vue, Svelte that can make your life ....
        </p>
      </motion.div>
      <motion.div
        className="ml-auto flex w-3/4 flex-row items-center justify-end space-x-2 rounded-full border border-neutral-700 bg-neutral-900 p-2"
        variants={variantsSecond}
      >
        <p className="text-neutral-300 text-xs">Use PHP.</p>
        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
      </motion.div>
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
    className: "md:col-span-1",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
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
