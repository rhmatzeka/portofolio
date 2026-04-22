import { motion } from 'framer-motion'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import ConnectWallet from './ConnectWallet'
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
  initial: { opacity: 0, y: 28, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } }
}

const Contact = () => {
  const [showTipModal, setShowTipModal] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState('ETH')
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    message: '',
    website: ''
  })
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [isSending, setIsSending] = useState(false)

  const walletAddresses = {
    ETH: '0x8988140cEF5A825f39929c60c97173ec5a2eF27D',
    BTC: 'bc1qyxfw58xn08qydxcmspq4cjjmq63v2wqh29eh2l',
    SOL: '6oga2odADjQcFdyiyt7fqxP3XERsmj1ZkUAw3wdPqFk'
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }))

    if (formStatus.type === 'error') {
      setFormStatus({ type: '', message: '' })
    }
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    if (isSending) return

    const name = formValues.name.trim()
    const email = formValues.email.trim()
    const message = formValues.message.trim()
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!name || !email || !message) {
      setFormStatus({ type: 'error', message: 'Please fill in all fields first.' })
      return
    }

    if (!emailIsValid) {
      setFormStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setIsSending(true)
    setFormStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          website: formValues.website
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send message.')
      }

      setFormStatus({
        type: 'success',
        message: 'Message sent. I will reply as soon as possible.'
      })
      setFormValues({ name: '', email: '', message: '', website: '' })
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: error.message || 'Message failed to send. Please try again in a moment.'
      })
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const handleTabClick = (crypto) => {
    setSelectedCrypto(crypto)
  }

  const handleCloseModal = () => {
    setShowTipModal(false)
  }

  return (
    <motion.div 
      className="contact-container"
      variants={containerVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.14 }}
      exit="out"
    >
      <div className="contact-content">
        <motion.div className="contact-left" variants={itemUp}>
          <h1 className="contact-title">Let's Build<br/>Something <span className="gradient-text">Amazing</span></h1>
          <p className="contact-subtitle">Got a project in mind? Whether it's Web3, UI/UX, or fullstack development I'd love to hear about it.</p>
          
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

            <a href="https://instagram.com/rahmatdev.id" target="_blank" rel="noopener noreferrer" className="contact-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect>
                <circle cx="12" cy="12" r="4.2"></circle>
                <circle cx="18" cy="6.2" r="1"></circle>
              </svg>
              <span>instagram.com/rahmatdev.id</span>
            </a>

            <a href="https://twitter.com/rahmatdevID" target="_blank" rel="noopener noreferrer" className="contact-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.2 1.8-2.2-.8.5-1.7.8-2.6 1-1.6-1.7-4.5-1.8-6.2-.2-1.1 1-1.5 2.5-1.1 3.9-3.3-.2-6.4-1.8-8.4-4.4-1.1 1.9-.5 4.4 1.3 5.6-.6 0-1.2-.2-1.7-.5 0 2.1 1.5 3.9 3.6 4.3-.6.2-1.3.3-1.9.1.5 1.8 2.2 3 4.1 3.1-1.8 1.4-4 2-6.3 1.8 2 1.3 4.4 2 6.9 2 8.2 0 12.8-7 12.6-13.2.9-.6 1.6-1.4 2.2-2.2Z"></path>
              </svg>
              <span>twitter.com/rahmatdevID</span>
            </a>
          </div>

          {/* Crypto Buttons Row */}
          <div className="crypto-buttons-row">
            <button className="crypto-tip-btn" onClick={() => setShowTipModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Crypto Tip
            </button>
            <ConnectWallet />
          </div>
        </motion.div>

        <motion.div variants={itemUp} className="contact-form-card">
          <div className="contact-form-heading">
            <span className="contact-form-kicker">Start a Project</span>
            <h2>Tell me what you are building</h2>
          </div>

          <form className="contact-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="form-input"
                value={formValues.name}
                onChange={handleFormChange}
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="form-input"
                value={formValues.email}
                onChange={handleFormChange}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows="4"
                placeholder="Tell me about your project..."
                className="form-textarea"
                value={formValues.message}
                onChange={handleFormChange}
              />
            </div>

            <input
              className="form-hidden-field"
              name="website"
              value={formValues.website}
              onChange={handleFormChange}
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
            />

            {formStatus.message && (
              <p className={`form-status ${formStatus.type}`} role="status">
                {formStatus.message}
              </p>
            )}
            
            <button type="submit" className="form-button" disabled={isSending}>
              <span>{isSending ? 'Sending...' : 'Send Message'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </motion.div>
      </div>

      {/* Crypto Tip Modal */}
      {showTipModal && (
        <motion.div 
          className="tip-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
        >
          <motion.div 
            className="tip-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <button className="tip-modal-close" onClick={handleCloseModal} type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="tip-modal-title">Send a Crypto Tip 💰</h2>
            <p className="tip-modal-subtitle">Choose your preferred currency</p>

            {/* Crypto Tabs */}
            <div className="tip-crypto-tabs">
              {Object.keys(walletAddresses).map((crypto) => (
                <button
                  key={crypto}
                  className={`tip-crypto-tab ${selectedCrypto === crypto ? 'active' : ''}`}
                  onClick={() => handleTabClick(crypto)}
                  type="button"
                >
                  {crypto}
                </button>
              ))}
            </div>

            {/* Selected Wallet Display */}
            <div className="tip-wallet-display">
              <div className="tip-qr-code">
                <QRCodeSVG 
                  value={walletAddresses[selectedCrypto]}
                  size={140}
                  level="H"
                  includeMargin={true}
                  bgColor="#000000"
                  fgColor="#00d1ff"
                />
              </div>

              <div className="tip-address-section">
                <label className="tip-address-label">Wallet Address</label>
                <div className="tip-address-box">
                  <code>{walletAddresses[selectedCrypto]}</code>
                </div>
                <button 
                  className="tip-copy-button"
                  onClick={() => copyToClipboard(walletAddresses[selectedCrypto])}
                >
                  {copiedAddress ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Address
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="tip-modal-footer">Thank you for your support! 🙏</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Contact
