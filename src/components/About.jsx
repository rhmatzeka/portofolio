import { motion } from 'framer-motion'
import avatar from '../assets/images/k.jpg'
import ScrollFrameScene from './ScrollFrameScene'
import './About.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.04 } }
}

const itemLeft = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.64, ease: [0.16, 1, 0.3, 1] } }
}

const itemRight = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.64, ease: [0.16, 1, 0.3, 1] } }
}

const stack = [
  { name: 'React', url: 'https://react.dev', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'Next.js', url: 'https://nextjs.org', icon: 'https://cdn.simpleicons.org/nextdotjs/FFFFFF' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
  { name: 'Python', url: 'https://python.org', icon: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'Solidity', url: 'https://soliditylang.org', icon: 'https://cdn.simpleicons.org/solidity/FFFFFF' },
  { name: 'Node.js', url: 'https://nodejs.org', icon: 'https://cdn.simpleicons.org/nodedotjs/5FA04E' },
  { name: 'Figma', url: 'https://figma.com', icon: 'https://cdn.simpleicons.org/figma' },
  { name: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
  { name: 'Docker', url: 'https://docker.com', icon: 'https://cdn.simpleicons.org/docker/2496ED' },
  { name: 'CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', icon: 'https://cdn.simpleicons.org/css/663399' },
  { name: 'Laravel', url: 'https://laravel.com', icon: 'https://cdn.simpleicons.org/laravel/FF2D20' },
  { name: 'Nginx', url: 'https://nginx.org', icon: 'https://cdn.simpleicons.org/nginx/009639' },
  { name: 'Supabase', url: 'https://supabase.com', icon: 'https://cdn.simpleicons.org/supabase/3FCF8E' },
  { name: 'Prisma', url: 'https://prisma.io', icon: 'https://cdn.simpleicons.org/prisma/2D3748' },
  { name: 'Express', url: 'https://expressjs.com', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
  { name: 'Tailwind', url: 'https://tailwindcss.com', icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
  { name: 'Java', url: 'https://java.com', icon: 'https://cdn.simpleicons.org/openjdk/FFFFFF' },
  { name: 'PostgreSQL', url: 'https://postgresql.org', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { name: 'MySQL', url: 'https://mysql.com', icon: 'https://cdn.simpleicons.org/mysql/4479A1' }
]

const stackRows = [
  stack.filter((_, index) => index % 3 === 0),
  stack.filter((_, index) => index % 3 === 1),
  stack.filter((_, index) => index % 3 === 2)
]

const TechPill = ({ tech, className = '' }) => (
  <a
    href={tech.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`stack-tag ${className}`}
  >
    <span className="stack-icon">
      <img src={tech.icon} alt="" loading="lazy" />
    </span>
    {tech.name}
  </a>
)

const About = () => {
  return (
    <motion.section
      className="about-shell"
      variants={containerVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.02, margin: '0px 0px -8% 0px' }}
    >
      <div className="about-container">
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
            I love latenight coding, futuristic UI/UX, and AI experimentation.
            My goal is to become a fullstack dev at a major tech company.
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
              <span className="stat-number">19</span>
              <span className="stat-label">Stacks</span>
            </div>
          </div>

        </motion.div>
      </div>

      <ScrollFrameScene />

      <motion.div className="stack-marquee" variants={itemRight}>
        <span className="stack-label stack-marquee-label">Tech Stack</span>
        <div className="marquee-panel">
          {stackRows.map((row, index) => (
            <div
              key={index}
              className={`marquee-row ${index % 2 === 1 ? 'reverse' : ''}`}
            >
              <div className="marquee-track">
                {[...row, ...row, ...row].map((tech, techIndex) => (
                  <TechPill
                    key={`${tech.name}-${techIndex}`}
                    tech={tech}
                    className="marquee-pill"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  )
}

export default About
