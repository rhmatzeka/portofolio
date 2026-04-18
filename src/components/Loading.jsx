import { motion } from 'framer-motion'
import './Loading.css'

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
      className="loading-container"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="loading-content">
        <div className="loading-dots">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="loading-dot"
              custom={i}
              variants={dotVariants}
              animate="animate"
            />
          ))}
        </div>

        <motion.div 
          className="loading-line"
          variants={lineVariants}
          animate="animate"
        />

        <p className="loading-text">Loading amazing things...</p>
      </div>

      <div className="loading-bg-gradient" />
    </motion.div>
  )
}

export default Loading
