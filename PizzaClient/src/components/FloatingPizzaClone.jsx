import { useTheme } from "@mui/material";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React from "react";

/**
 * FloatingPizzaClone
 * Renders a floating (absolutely positioned) clone of a pizza row for the fly-to-basket animation.
 * Uses advanced Motion library features for modern, fluid animations with realistic physics.
 * Theme-aware to work properly in both light and dark modes.
 *
 * @param {Object} props
 * @param {Object} props.rect - {top, left, width, height} of the source row
 * @param {Object} props.target - {top, left} of the basket icon
 * @param {React.ReactNode} props.children - Row content to render inside the clone
 * @param {Function} props.onAnimationEnd - Callback when animation completes
 */
const FloatingPizzaClone = React.memo(function FloatingPizzaClone({
	rect,
	target,
	children,
	onAnimationEnd,
}) {
	// Get the current theme for mode-specific styling.
	const theme = useTheme();
	const isDarkMode = theme.palette.mode === "dark";

	// Motion values for smooth, curve-based animation with spring physics.
	// Hooks are used at the top level to adhere to React rules.
	const progress = useMotionValue(0);
	const springProgress = useSpring(progress, {
		stiffness: 120,
		damping: 20,
		restDelta: 0.001,
	});

	// Default values to prevent errors if `rect` is initially undefined.
	const defaultLeft = 0;
	const defaultTop = 0;

	// Safely access `rect` properties, using defaults if necessary.
	const startX = rect ? rect.left : defaultLeft;
	const startY = rect ? rect.top : defaultTop;
	const endX = rect ? rect.left + (target?.left || 0) : defaultLeft;
	const endY = rect ? rect.top + (target?.top || 0) : defaultTop;

	// Calculate distances to potentially adjust animation dynamics.
	const distanceY = Math.abs(target?.top || 0);
	const distanceX = Math.abs(target?.left || 0);
	const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

	// Control point for the quadratic Bezier curve, creating the arc path.
	const controlX = startX + (target?.left || 0) * 0.3; // Asymmetric curve
	const controlY = startY - Math.min(120, distance * 0.3); // Dynamic height

	// Calculates the x-coordinate along the Bezier curve for a given progress `t`.
	const bezierX = (t) => {
		const invT = 1 - t;
		return invT * invT * startX + 2 * invT * t * controlX + t * t * endX;
	};

	// Calculates the y-coordinate along the Bezier curve for a given progress `t`.
	const bezierY = (t) => {
		const invT = 1 - t;
		return invT * invT * startY + 2 * invT * t * controlY + t * t * endY;
	};

	// Create motion transforms for x and y based on the Bezier curve functions.
	const x = useTransform(
		springProgress,
		[0, 0.2, 0.4, 0.6, 0.8, 1],
		[0, 0.2, 0.4, 0.6, 0.8, 1].map(bezierX),
	);

	const y = useTransform(
		springProgress,
		[0, 0.2, 0.4, 0.6, 0.8, 1],
		[0, 0.2, 0.4, 0.6, 0.8, 1].map(bezierY),
	);

	// Additional transforms (scale, rotation, opacity) for visual flair during animation.
	const scale = useTransform(
		springProgress,
		[0, 0.2, 0.6, 0.8, 1],
		[1, 1.08, 0.9, 0.7, 0.5],
	);

	const rotate = useTransform(
		springProgress,
		[0, 0.3, 0.5, 0.7, 1],
		[0, -3, 2, -1, 0],
	);

	const opacity = useTransform(
		springProgress,
		[0, 0.6, 0.9, 1],
		[1, 0.95, 0.6, 0],
	);

	// Define theme-aware colors for the shadow/glow effect.
	const primaryColor = isDarkMode
		? `rgba(${theme.palette.success.main}, 0.5)`
		: "rgba(76, 175, 80, 0.4)";
	const primaryColorLighter = isDarkMode
		? `rgba(${theme.palette.success.light}, 0.3)`
		: "rgba(76, 175, 80, 0.3)";
	const primaryColorDarker = isDarkMode
		? `rgba(${theme.palette.success.dark}, 0.6)`
		: "rgba(76, 175, 80, 0.5)";

	// Create a motion transform for the `filter` property to animate a glow effect.
	const shadow = useTransform(
		springProgress,
		[0, 0.3, 0.6, 0.8, 1],
		[
			`drop-shadow(0 4px 12px ${primaryColorLighter})`,
			`drop-shadow(0 8px 16px ${primaryColorDarker})`,
			`drop-shadow(0 6px 14px ${primaryColor})`,
			`drop-shadow(0 4px 8px ${primaryColorLighter})`,
			"drop-shadow(0 0px 0px rgba(0, 0, 0, 0))",
		],
	);

	// Effect to start the animation when the component mounts or `rect` changes.
	React.useEffect(() => {
		if (rect) {
			progress.set(0); // Ensure animation starts from the beginning.
			// Animate the progress value from 0 to 1, driving all other transforms.
			const animation = {
				type: "tween",
				duration: 0.7,
				ease: [0.22, 0.68, 0.36, 0.96], // Custom bezier easing
			};

			// Use setTimeout to ensure the `progress.set(0)` takes effect before starting the animation.
			setTimeout(() => {
				progress.set(1, animation);
			}, 10);
		}

		return () => progress.stop();
	}, [rect, progress]);

	// Effect to detect when the spring animation is effectively complete.
	React.useEffect(() => {
		const unsubscribe = springProgress.on("change", (latest) => {
			// Trigger the `onAnimationEnd` callback when the animation is nearly finished.
			if (latest > 0.99) {
				onAnimationEnd?.();
			}
		});

		return () => unsubscribe();
	}, [springProgress, onAnimationEnd]);

	// Do not render the clone if the initial position (`rect`) is not yet available.
	if (!rect) return null;

	// Define background, border, and shadow colors based on the current theme mode.
	const backgroundColor = isDarkMode ? theme.palette.background.paper : "white";

	const borderColor = isDarkMode
		? `${theme.palette.success.main}66`
		: "rgba(186, 245, 196, 0.5)";

	const boxShadowColor = isDarkMode
		? `0 12px 32px 0 ${theme.palette.success.main}33, 0 4px 12px 0 rgba(0, 0, 0, 0.3)`
		: "0 12px 32px 0 rgba(76, 175, 80, 0.25), 0 4px 12px 0 rgba(0, 0, 0, 0.08)";

	return (
		<motion.div
			style={{
				position: "fixed",
				left: 0,
				top: 0,
				x,
				y,
				scale,
				rotate,
				opacity,
				filter: shadow,
				width: rect.width,
				height: rect.height,
				pointerEvents: "none",
				zIndex: 4000,
				background: backgroundColor,
				borderRadius: 16,
				boxShadow: boxShadowColor,
				border: `1px solid ${borderColor}`,
				overflow: "hidden",
				transformOrigin: "center center",
				willChange: "transform, opacity", // Performance optimization
			}}
		>
			{children}
		</motion.div>
	);
});

export default FloatingPizzaClone;
