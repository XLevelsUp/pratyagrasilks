// Split into its own chunk so LazyMotion can load it after hydration,
// keeping the animation engine off the route's critical path.
export { domAnimation as default } from 'framer-motion';
