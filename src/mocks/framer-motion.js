// Mock for framer-motion
import React from 'react';

// Mock motion components
const createMotionComponent = (component) => {
  const MotionComponent = React.forwardRef((props, ref) => {
    const { 
      animate, 
      initial, 
      exit, 
      transition, 
      whileHover, 
      whileTap, 
      layout,
      layoutId,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      onDrag,
      onDragStart,
      onDragEnd,
      variants,
      custom,
      ...otherProps 
    } = props;
    return React.createElement(component, { ...otherProps, ref });
  });
  MotionComponent.displayName = `motion.${component}`;
  return MotionComponent;
};

// Create motion object with common HTML elements
const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  nav: createMotionComponent('nav'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  main: createMotionComponent('main'),
  aside: createMotionComponent('aside'),
  form: createMotionComponent('form'),
  input: createMotionComponent('input'),
  textarea: createMotionComponent('textarea'),
  label: createMotionComponent('label'),
  img: createMotionComponent('img'),
  svg: createMotionComponent('svg'),
  path: createMotionComponent('path'),
  circle: createMotionComponent('circle'),
  rect: createMotionComponent('rect'),
  line: createMotionComponent('line'),
  polyline: createMotionComponent('polyline'),
  polygon: createMotionComponent('polygon'),
};

// Mock AnimatePresence
export const AnimatePresence = ({ children, ...props }) => {
  return React.createElement(React.Fragment, props, children);
};

// Mock useAnimation
export const useAnimation = () => ({
  start: jest.fn(() => Promise.resolve()),
  set: jest.fn(),
  stop: jest.fn(),
  mount: jest.fn(),
});

// Mock useMotionValue
export const useMotionValue = (initial) => ({
  get: () => initial,
  set: jest.fn(),
  onChange: jest.fn(),
  destroy: jest.fn(),
});

// Mock useTransform
export const useTransform = (value, input, output) => {
  return useMotionValue(output ? output[0] : input[0]);
};

// Mock useSpring
export const useSpring = (source, config) => {
  return useMotionValue(typeof source === 'object' ? source.get() : source);
};

// Mock useCycle
export const useCycle = (...items) => {
  const [current, setCurrent] = React.useState(0);
  const cycle = React.useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);
  
  return [items[current], cycle];
};

// Mock useScroll
export const useScroll = () => ({
  scrollX: useMotionValue(0),
  scrollY: useMotionValue(0),
  scrollXProgress: useMotionValue(0),
  scrollYProgress: useMotionValue(0),
});

// Mock useDragControls
export const useDragControls = () => ({
  start: jest.fn(),
});

// Mock useViewportScroll (deprecated but might be used)
export const useViewportScroll = () => useScroll();

// Mock stagger
export const stagger = (time, options) => time;

// Mock easing functions
export const easeIn = [0.4, 0, 1, 1];
export const easeOut = [0, 0, 0.2, 1];
export const easeInOut = [0.4, 0, 0.2, 1];
export const circIn = [0.6, 0.04, 0.98, 0.335];
export const circOut = [0.075, 0.82, 0.165, 1];
export const circInOut = [0.785, 0.135, 0.15, 0.86];
export const backIn = [0.6, -0.28, 0.735, 0.045];
export const backOut = [0.175, 0.885, 0.32, 1.275];
export const backInOut = [0.68, -0.55, 0.265, 1.55];

// Export motion as default and named export
export { motion };
export default motion;
