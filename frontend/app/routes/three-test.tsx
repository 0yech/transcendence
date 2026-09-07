import { NavBar } from '~/components/Navbar';
import { motion } from 'motion/react';
// import { Leva } from 'leva';

export default function ThreeTest() {
  return (
    <>
      <title>R3F Test</title>
      <NavBar className="fixed top-0"></NavBar>
      {/* <Leva /> */}
      <div className="w-full h-dvh flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <h1 className="text-9xl font-display text-shadow-lg">NONO99</h1>
        </motion.div>
      </div>
    </>
  );
}
