// @ts-nocheck
import { motion } from 'framer-motion'

const Loading = () => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const dotVariants = {
    animate: (i) => ({
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.1,
        ease: "easeInOut"
      }
    })
  }

  const lineVariants = {
    animate: {
      scaleX: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center overflow-hidden bg-black"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex h-[60px] items-end gap-4 max-md:h-[50px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-3 w-3 rounded-full bg-[linear-gradient(135deg,#00d1ff_0%,#0099cc_100%)] shadow-[0_0_20px_rgba(0,209,255,0.6)] max-md:h-2.5 max-md:w-2.5"
              custom={i}
              variants={dotVariants}
              animate="animate"
            />
          ))}
        </div>

        <motion.div 
          className="h-px w-[100px] origin-center bg-[linear-gradient(90deg,transparent,#00d1ff,transparent)] max-md:w-20"
          variants={lineVariants}
          animate="animate"
        />

        <motion.p
          className="m-0 text-base font-medium uppercase tracking-[1px] text-white/70 max-md:text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Loading portfolio
        </motion.p>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.1)_0%,transparent_70%)]" />
    </motion.div>
  )
}

export default Loading
