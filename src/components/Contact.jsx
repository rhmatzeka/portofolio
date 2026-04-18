import { motion } from 'framer-motion'
import './Contact.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  },
  out: { opacity: 0, transition: { duration: 0.3 } }
}

const itemUp = {
  initial: { opacity: 0, y: 30 },
  in: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const Contact = () => {
  return (
    <motion.div 
      className="contact-container"
      variants={containerVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.3 }}
      exit="out"
    >
      <div className="contact-content">
        <motion.div className="contact-left" variants={itemUp}>
          <h1 className="contact-title">Let's Build<br/>Something <span className="gradient-text">Amazing</span></h1>
          <p className="contact-subtitle">Got a project in mind? Whether it's Web3, UI/UX, or full-stack development — I'd love to hear about it.</p>
          
          <div className="contact-info">
            <a href="mailto:matsganz@gmail.com" className="contact-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>matsganz@gmail.com</span>
            </a>
            
            <a href="https://github.com/rhmatzeka" target="_blank" rel="noopener noreferrer" className="contact-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span>github.com/rhmatzeka</span>
            </a>
            
            <a href="https://linkedin.com/in/rahmatekasatria" target="_blank" rel="noopener noreferrer" className="contact-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <span>linkedin.com/in/rahmatekasatria</span>
            </a>
          </div>
        </motion.div>

        <motion.div variants={itemUp} className="contact-form-card">
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" placeholder="John Doe" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" placeholder="john@example.com" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea rows="4" placeholder="Tell me about your project..." className="form-textarea"></textarea>
            </div>
            
            <button type="submit" className="form-button">
              Send Message
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Contact
