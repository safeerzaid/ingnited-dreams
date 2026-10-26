"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div";
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  className = "",
  style = {},
  delay = 0,
  as: Tag = "h2",
}) => {
  const lines = typeof text === "string" ? text.split(/<br\s*\/?>/i) : [text];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: "110%",
      skewY: 7,
      opacity: 0,
    },
    visible: {
      y: 0,
      skewY: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const MotionTag = motion[Tag as keyof typeof motion] as any;

  return (
    <Tag
      className={`animated-title-container ${className}`}
      style={{ ...style, display: "block" }}
    >
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        style={{ display: "block" }}
      >
        {lines.map((line, index) => (
          <span
            key={index}
            style={{
              display: "block",
              overflow: "hidden",
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
            }}
          >
            <motion.span
              variants={itemVariants}
              style={{
                display: "block",
                willChange: "transform, opacity",
                transformOrigin: "left top",
                lineHeight: 1.15,
              }}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          </span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default AnimatedTitle;
