"use client";

import { roadmapEvents } from "@/data/roadmap";
import { AnimatePresence, motion, PanInfo } from "motion/react";
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { memo, useState } from "react";

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

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

function RoadmapSectionComponent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const formatPeriod = (item: (typeof roadmapEvents)[0]) => {
    if (item.periodType === "Q") {
      return `Q${item.periodNumber} ${item.year}`;
    } else if (item.periodType === "H") {
      return `H${item.periodNumber} ${item.year}`;
    }
    return `${item.year}`;
  };

  const getStatus = (item: (typeof roadmapEvents)[0]) => {
    if (item.isChecked) {
      return {
        label: "Completed",
        color: "rgba(34, 197, 94, 0.8)",
      };
    }

    const hasCompletedEvents = item.events.some((event) => event.isChecked);

    if (hasCompletedEvents) {
      return {
        label: "In progress",
        color: "rgba(249, 115, 22, 0.8)",
      };
    }

    return {
      label: "Planned",
      color: "rgba(156, 163, 175, 0.5)",
    };
  };

  const toggleExpand = (index: number) => {
    if (index === currentIndex) {
      setIsDetailsExpanded((prev) => !prev);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === roadmapEvents.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? roadmapEvents.length - 1 : prev - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    index: number
  ) => {
    const SWIPE_THRESHOLD = 50;
    if (info.offset.x > SWIPE_THRESHOLD && index === currentIndex) {
      prevSlide();
    } else if (info.offset.x < -SWIPE_THRESHOLD && index === currentIndex) {
      nextSlide();
    }
  };

  const cardVariants = {
    active: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 10,
    },
    inactive: {
      scale: 0.9,
      opacity: 0.5,
      zIndex: 0,
    },
  };

  const cardTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

  return (
    <section
      id="roadmap-section"
      style={{
        padding: "4rem 1rem",
        background: "#000",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
          Roadmap
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
            margin: "0 auto 4rem",
            lineHeight: 1.45,
          }}
        >
          Our journey to building the most private AI assistant
        </p>

        <div style={{ position: "relative" }}>
          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            style={{
              position: "absolute",
              left: "-1rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "3rem",
              height: "3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <svg
              fill="none"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "rotate(180deg)", color: "#fff" }}
            >
              <path
                d="M10.75 8.75L14.25 12L10.75 15.25"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            style={{
              position: "absolute",
              right: "-1rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "3rem",
              height: "3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <svg
              fill="none"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "#fff" }}
            >
              <path
                d="M10.75 8.75L14.25 12L10.75 15.25"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {/* Timeline line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: "2px",
              background:
                "linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0) 100%)",
              zIndex: 0,
            }}
          />

          {/* Carousel container */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              height: "30rem",
              touchAction: "pan-x",
            }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {roadmapEvents.map((item, index) => {
                const status = getStatus(item);

                return (
                <motion.div
                  key={index}
                  style={{
                    position: "absolute",
                    width: "18rem",
                    x: `${Math.round((index - currentIndex) * 300)}px`,
                    willChange: "transform",
                    transform: "translateZ(0)",
                    cursor: index !== currentIndex ? "pointer" : "default",
                  }}
                  variants={cardVariants}
                  initial="inactive"
                  animate={index === currentIndex ? "active" : "inactive"}
                  drag="x"
                  dragConstraints={{ left: -50, right: 50 }}
                  dragElastic={0.1}
                  onDragEnd={(e, info) => handleDragEnd(e, info, index)}
                  onClick={() => {
                    if (index !== currentIndex) {
                      goToSlide(index);
                    }
                  }}
                >
                  {/* Timeline dot */}
                  <motion.div
                    variants={cardVariants}
                    initial="inactive"
                    animate={index === currentIndex ? "active" : "inactive"}
                    style={{
                      position: "absolute",
                      left: "calc(50% - 0.75rem)",
                      top: "-1rem",
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                      zIndex: 10,
                      background:
                        index === currentIndex
                          ? "rgba(255, 255, 255, 0.9)"
                          : "transparent",
                      border: "2px solid rgba(255, 255, 255, 0.5)",
                      willChange: "transform",
                    }}
                  />

                  {/* Card */}
                  <motion.div
                    layout
                    style={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div
                      className={ibmPlexSans.className}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow:
                          "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {/* Card header */}
                      <div
                        onClick={() => toggleExpand(index)}
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          cursor:
                            index === currentIndex ? "pointer" : "default",
                        }}
                      >
                        {/* Period badge */}
                        <div
                          style={{
                            padding: "0.375rem 0.875rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "rgba(255, 255, 255, 0.95)",
                            background: "rgba(255, 255, 255, 0.12)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "999px",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {item.year}
                        </div>

                        <h3
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            color: "rgba(255, 255, 255, 0.95)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {`${formatPeriod(item)} Goals`}
                        </h3>

                        {/* Status */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.6)",
                            marginTop: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "1rem",
                              height: "1rem",
                              marginRight: "0.5rem",
                              borderRadius: "50%",
                              background: status.color,
                            }}
                          />
                          {status.label}
                        </div>

                        {/* Expand indicator */}
                        {index === currentIndex && (
                          <motion.div
                            animate={{
                              rotate: isDetailsExpanded ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            style={{ marginTop: "0.75rem" }}
                          >
                            <svg
                              fill="none"
                              height="20"
                              viewBox="0 0 24 24"
                              width="20"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ color: "rgba(255, 255, 255, 0.5)" }}
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isDetailsExpanded && index === currentIndex && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              style={{
                                padding: "0 1.5rem 1.5rem",
                                borderTop:
                                  "1px solid rgba(255, 255, 255, 0.1)",
                                paddingTop: "1rem",
                              }}
                            >
                              <h4
                                style={{
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  color: "rgba(255, 255, 255, 0.8)",
                                  textAlign: "center",
                                  marginBottom: "1rem",
                                }}
                              >
                                Events
                              </h4>
                              <ul
                                style={{
                                  display: "grid",
                                  gap: "0.75rem",
                                }}
                              >
                                {item.events.map((event, i) => (
                                  <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      delay: i * 0.1,
                                      ease: "easeOut",
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "1rem",
                                        height: "1rem",
                                        marginRight: "0.75rem",
                                        marginTop: "0.125rem",
                                        flexShrink: 0,
                                        borderRadius: "50%",
                                        background: event.isChecked
                                          ? "rgba(34, 197, 94, 0.8)"
                                          : "rgba(156, 163, 175, 0.5)",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "0.875rem",
                                        color: "rgba(255, 255, 255, 0.7)",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {event.title}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
            </div>
          </div>

          {/* Pagination dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              gap: "0.5rem",
            }}
          >
            {roadmapEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: "0.75rem",
                  height: "0.75rem",
                  borderRadius: "50%",
                  background:
                    index === currentIndex
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const RoadmapSection = memo(RoadmapSectionComponent);
