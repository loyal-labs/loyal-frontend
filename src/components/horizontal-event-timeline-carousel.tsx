"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { roadmapEvents as events } from "@/data/roadmap";

const height = "30rem";

export default function HorizontalEventTimelineCarousel() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState<number>(100);
  const carouselRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null); // Ref for the header content

  // Calculate expanded height based on total height minus header height
  useEffect(() => {
    if (carouselRef.current && headerRef.current) {
      const totalHeight = carouselRef.current.getBoundingClientRect().height;
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      // Calculate available space for expanded section
      // Subtract header height and some padding (e.g., 20px) from total height
      const availableHeight = totalHeight - headerHeight - 110;
      setExpandedHeight(Math.max(availableHeight, 50)); // Ensure minimum height of 50px
    }
  }, []);

  const toggleExpand = (index: number) => {
    if (index === currentIndex) {
      setExpandedIndex(expandedIndex === index ? null : index);
    }
  };

  const formatPeriod = (item: (typeof events)[0]) => {
    if (item.periodType === "Q") {
      return `Q${item.periodNumber} ${item.year}`;
    }
    if (item.periodType === "H") {
      return `H${item.periodNumber} ${item.year}`;
    }
    return `${item.year}`;
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    setExpandedIndex(null);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
    setExpandedIndex(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setExpandedIndex(null);
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
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    inactive: {
      scale: 0.9,
      opacity: 0.7,
      zIndex: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-center font-bold text-3xl md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        Project Timeline
      </motion.h1>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Our development journey and milestones
      </motion.p>

      <div className="relative">
        <button
          className="-translate-y-1/2 absolute top-1/2 left-0 z-20 rounded-full bg-background p-2 shadow-md transition-colors hover:bg-primary/10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className="-translate-y-1/2 absolute top-1/2 right-0 z-20 rounded-full bg-background p-2 shadow-md transition-colors hover:bg-primary/10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute top-1/2 right-0 left-0 z-0 h-0.5 bg-primary/20" />

        <div
          className="relative touch-pan-x overflow-hidden"
          ref={carouselRef}
          style={{ height }}
        >
          <div className="flex h-full items-center justify-center">
            {events.map((item, index) => (
              <motion.div
                animate={index === currentIndex ? "active" : "inactive"}
                className="absolute mx-4 w-64"
                drag="x"
                dragConstraints={{ left: -50, right: 50 }}
                dragElastic={0.1}
                initial="inactive"
                key={index}
                onDragEnd={(e, info) => handleDragEnd(e, info, index)}
                style={{
                  x: `${Math.round((index - currentIndex) * 300)}px`,
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
                variants={cardVariants}
              >
                <motion.div
                  animate={index === currentIndex ? "active" : "inactive"}
                  className={`-translate-x-1/2 absolute top-[-1rem] left-1/2 z-10 h-6 w-6 transform rounded-full ${
                    index === currentIndex
                      ? "bg-primary"
                      : "border-2 border-primary bg-transparent"
                  }`}
                  initial="inactive"
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                  variants={cardVariants}
                />

                <motion.div
                  className="w-full"
                  layout
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Card className="overflow-hidden border-primary/10 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                    <CardContent className="p-0">
                      <div
                        className={`flex flex-col items-center p-6 text-center ${
                          index === currentIndex
                            ? "cursor-pointer"
                            : "cursor-default"
                        }`} // Measure first card's header
                        onClick={() => toggleExpand(index)}
                        ref={index === 0 ? headerRef : null}
                      >
                        <Badge
                          className="mb-2 border-primary/20 bg-primary/5 px-3 py-1 text-sm"
                          variant="outline"
                        >
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatPeriod(item)}
                        </Badge>
                        <h3 className="font-bold text-primary text-xl">
                          {item.year} Milestones
                        </h3>
                        <p className="font-medium text-lg">
                          {item.periodType === "Q"
                            ? `Quarter ${item.periodNumber}`
                            : `Half ${item.periodNumber}`}
                        </p>
                        <div className="mt-1 flex items-center text-muted-foreground text-sm">
                          <CheckCircle
                            className={`mr-1 h-4 w-4 ${
                              item.isChecked
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                          {item.isChecked ? "Completed" : "Planned"}
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedIndex === index ? 180 : 0,
                            opacity: index === currentIndex ? 1 : 0.5,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="mt-2 h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {expandedIndex === index && index === currentIndex && (
                          <motion.div
                            animate={{ height: expandedHeight, opacity: 1 }}
                            className="overflow-y-auto"
                            exit={{ height: 0, opacity: 0 }}
                            initial={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="border-border/50 border-t px-6 pt-2 pb-6">
                              <div className="mb-4">
                                <h4 className="mb-2 flex items-center justify-center font-semibold text-sm">
                                  Events
                                </h4>
                                <ul className="grid grid-cols-1 gap-2">
                                  {item.events.map((event, i) => (
                                    <motion.li
                                      animate={{ opacity: 1, x: 0 }}
                                      className="flex items-start"
                                      initial={{ opacity: 0, x: -20 }}
                                      key={i}
                                      transition={{
                                        duration: 0.3,
                                        delay: i * 0.1,
                                        ease: "easeOut",
                                      }}
                                    >
                                      <CheckCircle
                                        className={`mr-2 h-4 w-4 ${
                                          event.isChecked
                                            ? "text-green-500"
                                            : "text-gray-400"
                                        } mt-0.5 shrink-0`}
                                      />
                                      <span className="text-sm">
                                        {event.title}
                                      </span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {events.map((_, index) => (
            <button
              aria-label={`Go to slide ${index + 1}`}
              className={`h-3 w-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-primary/20"
              }`}
              key={index}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
