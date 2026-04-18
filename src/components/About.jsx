import { motion } from 'framer-motion'
import avatar from '../k.jpg'
import './About.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
}

const itemLeft = {
  initial: { opacity: 0, x: -40 },
  in: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}

const itemRight = {
  initial: { opacity: 0, x: 40 },
  in: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}

const stack = [
  { name: 'React', url: 'https://react.dev' },
  { name: 'Next.js', url: 'https://nextjs.org' },
  { name: 'Solidity', url: 'https://soliditylang.org' },
  { name: 'Node.js', url: 'https://nodejs.org' },
  { name: 'Figma', url: 'https://figma.com' },
  { name: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'PostgreSQL', url: 'https://postgresql.org' },
  { name: 'MySQL', url: 'https://mysql.com' }
]

const About = () => {
  return (
    <motion.div
      className="about-container"
      variants={containerVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Avatar */}
      <motion.div className="about-avatar-wrapper" variants={itemLeft}>
        <div className="about-avatar-glow" />
        <img src={avatar} alt="Rahmat Eka Satria" className="about-avatar" />
      </motion.div>

      {/* Content */}
      <motion.div className="about-content" variants={itemRight}>
        <h2 className="about-tagline">
          I turn ideas into<br />
          <span>digital experiences</span>
        </h2>

        <p className="about-bio">
          A budding developer passionate about blockchain and web development.
          Started from scratch, now proficient in modern frameworks.
          I love late-night coding, futuristic UI/UX, and AI experimentation.
          My goal is to become a full-stack dev at a major tech company.
        </p>

        <div className="about-stats">
          <div className="stat">
            <span className="stat-number">2+</span>
            <span className="stat-label">Years Exp</span>
          </div>
          <div className="stat">
            <span className="stat-number">10+</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat">
            <span className="stat-number">3</span>
            <span className="stat-label">Stacks</span>
          </div>
        </div>

        <div className="about-stack">
          <span className="stack-label">Tech Stack</span>
          <div className="stack-tags">
            {stack.map(tech => (
              <a 
                key={tech.name} 
                href={tech.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="stack-tag"
              >
                {tech.name}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default About
