import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useTheme } from '@mui/material';

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
function FloatingPizzaClone({ rect, target, children, onAnimationEnd }) {
  // Get the current theme
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Motion values for smooth curve-based animation with spring physics
  // Using hooks at the top level to avoid conditional calls
  const progress = useMotionValue(0);
  const springProgress = useSpring(progress, {
    stiffness: 120,
    damping: 20,
    restDelta: 0.001
  });
  
  // Default values for when rect is not provided
  const defaultLeft = 0;
  const defaultTop = 0;
  
  // Safely access rect properties
  const startX = rect ? rect.left : defaultLeft;
  const startY = rect ? rect.top : defaultTop;
  const endX = rect ? (rect.left + (target?.left || 0)) : defaultLeft;
  const endY = rect ? (rect.top + (target?.top || 0)) : defaultTop;
  
  // Calculate distances for path control
  const distanceY = Math.abs(target?.top || 0);
  const distanceX = Math.abs(target?.left || 0);
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
  // Control point (peak of the arc) - this creates the curved path
  const controlX = startX + (target?.left || 0) * 0.3; // Asymmetric curve
  const controlY = startY - Math.min(120, distance * 0.3); // Dynamic height
  
  // Transform progress to x coordinates along bezier curve
  const bezierX = (t) => {
    const invT = 1 - t;
    return invT * invT * startX + 2 * invT * t * controlX + t * t * endX;
  };
  
  // Transform progress to y coordinates along bezier curve
  const bezierY = (t) => {
    const invT = 1 - t;
    return invT * invT * startY + 2 * invT * t * controlY + t * t * endY;
  };
  
  // Create transforms for x and y based on the quadratic bezier curve
  const x = useTransform(springProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], 
    [0, 0.2, 0.4, 0.6, 0.8, 1].map(bezierX));
  
  const y = useTransform(springProgress, [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0, 0.2, 0.4, 0.6, 0.8, 1].map(bezierY));
  
  // Scale, rotation and opacity transforms for added visual interest
  const scale = useTransform(springProgress, 
    [0, 0.2, 0.6, 0.8, 1], 
    [1, 1.08, 0.9, 0.7, 0.5]
  );
  
  const rotate = useTransform(springProgress, 
    [0, 0.3, 0.5, 0.7, 1], 
    [0, -3, 2, -1, 0]
  );
  
  const opacity = useTransform(springProgress, 
    [0, 0.6, 0.9, 1], 
    [1, 0.95, 0.6, 0]
  );
  
  // Theme-aware colors for the glow effect
  const primaryColor = isDarkMode ? `rgba(${theme.palette.success.main}, 0.5)` : 'rgba(76, 175, 80, 0.4)';
  const primaryColorLighter = isDarkMode ? `rgba(${theme.palette.success.light}, 0.3)` : 'rgba(76, 175, 80, 0.3)';
  const primaryColorDarker = isDarkMode ? `rgba(${theme.palette.success.dark}, 0.6)` : 'rgba(76, 175, 80, 0.5)';
  
  // Glow effect transform - theme-aware
  const shadow = useTransform(springProgress,
    [0, 0.3, 0.6, 0.8, 1],
    [
      `drop-shadow(0 4px 12px ${primaryColorLighter})`,
      `drop-shadow(0 8px 16px ${primaryColorDarker})`,
      `drop-shadow(0 6px 14px ${primaryColor})`, 
      `drop-shadow(0 4px 8px ${primaryColorLighter})`,
      'drop-shadow(0 0px 0px rgba(0, 0, 0, 0))'
    ]
  );
  
  // Start the animation when component mounts
  React.useEffect(() => {
    if (rect) {
      progress.set(0); // Reset to start
      // Animate to end value - this drives all transforms
      const animation = {
        type: "tween",
        duration: 0.7,
        ease: [0.22, 0.68, 0.36, 0.96] // Custom bezier easing
      };
      
      // Use setTimeout to ensure we start from 0
      setTimeout(() => {
        progress.set(1, animation);
      }, 10);
    }
    
    return () => progress.stop();
  }, [rect, progress]);
  
  // Handle animation completion
  React.useEffect(() => {
    const unsubscribe = springProgress.on("change", (latest) => {
      // Call animation end when we're very close to completion
      if (latest > 0.99) {
        onAnimationEnd && onAnimationEnd();
      }
    });
    
    return () => unsubscribe();
  }, [springProgress, onAnimationEnd]);
  
  // Skip rendering if rect is not provided
  if (!rect) return null;
  
  // Background and border colors based on theme
  const backgroundColor = isDarkMode ? 
    theme.palette.background.paper : 
    'white';
  
  const borderColor = isDarkMode ? 
    `${theme.palette.success.main}66` : 
    'rgba(186, 245, 196, 0.5)';
  
  const boxShadowColor = isDarkMode ?
    `0 12px 32px 0 ${theme.palette.success.main}33, 0 4px 12px 0 rgba(0, 0, 0, 0.3)` :
    '0 12px 32px 0 rgba(76, 175, 80, 0.25), 0 4px 12px 0 rgba(0, 0, 0, 0.08)';
  
  return (
    <motion.div
      style={{
        position: 'fixed',
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
        pointerEvents: 'none',
        zIndex: 4000,
        background: backgroundColor,
        borderRadius: 16,
        boxShadow: boxShadowColor,
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        transformOrigin: 'center center',
        willChange: 'transform, opacity', // Performance optimization
      }}
    >
      {children}
    </motion.div>
  );
}

export default FloatingPizzaClone;
