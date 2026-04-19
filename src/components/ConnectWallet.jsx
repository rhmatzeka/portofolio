import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ethers } from 'ethers'
import './ConnectWallet.css'

const RECIPIENT_ADDRESS = '0x8988140cEF5A825f39929c60c97173ec5a2eF27D'

const ConnectWallet = ({ compact = false }) => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('0.001')
  const [status, setStatus] = useState(null)
  const [txHash, setTxHash] = useState(null)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found! Please install MetaMask first.')
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletAddress(accounts[0])
      setShowModal(true)
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setShowModal(false)
    setStatus(null)
    setTxHash(null)
  }

  const sendDonation = async () => {
    if (!walletAddress) return
    try {
      setStatus('loading')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const tx = await signer.sendTransaction({
        to: RECIPIENT_ADDRESS,
        value: ethers.parseEther(amount)
      })
      setTxHash(tx.hash)
      setStatus('success')
    } catch (err) {
      console.error('Transaction failed:', err)
      setStatus('error')
    }
  }

  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  return (
    <>
      {/* Connect / Connected Button */}
      {!walletAddress ? (
        <button className={`connect-wallet-btn ${compact ? 'compact' : ''}`} onClick={connectWallet}>
          {compact ? 'Donate' : 'Connect Wallet to Donate'}
        </button>
      ) : (
        <div className="wallet-connected-row">
          <button className="wallet-connected-btn" onClick={() => setShowModal(true)}>
            <span className="wallet-dot" />
            {shortAddress(walletAddress)}
          </button>
          {!compact && <button className="wallet-disconnect-btn" onClick={disconnectWallet}>Disconnect</button>}
        </div>
      )}

      {/* Donate Modal */}
      <AnimatePresence>
        {showModal && walletAddress && (
          <motion.div
            className="donate-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowModal(false); setStatus(null) }}
          >
            <motion.div
              className="donate-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="donate-close" onClick={() => { setShowModal(false); setStatus(null) }} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {status === 'success' ? (
                <div className="donate-success">
                  <div className="donate-success-icon">✅</div>
                  <h3>Transaction Sent!</h3>
                  <p>Thank you for your support! 🙏</p>
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="donate-etherscan-btn"
                  >
                    View on Etherscan ↗
                  </a>
                  <button className="donate-again-btn" onClick={() => setStatus(null)} type="button">
                    Donate Again
                  </button>
                </div>
              ) : status === 'error' ? (
                <div className="donate-success">
                  <div className="donate-success-icon">❌</div>
                  <h3>Transaction Failed</h3>
                  <p>Something went wrong. Please try again.</p>
                  <button className="donate-again-btn" onClick={() => setStatus(null)} type="button">
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="donate-title">Send ETH Donation</h2>
                  <p className="donate-subtitle">Support my work directly via MetaMask</p>

                  <div className="donate-wallet-info">
                    <span className="wallet-dot" />
                    <span>{shortAddress(walletAddress)}</span>
                    <span className="donate-network">Ethereum Mainnet</span>
                  </div>

                  <div className="donate-amount-section">
                    <label className="donate-label">Amount (ETH)</label>
                    <div className="donate-presets">
                      {['0.001', '0.005', '0.01', '0.05'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`donate-preset ${amount === val ? 'active' : ''}`}
                          onClick={() => setAmount(val)}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      className="donate-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.0001"
                      step="0.001"
                      placeholder="Custom amount"
                    />
                  </div>

                  <div className="donate-to">
                    <span className="donate-label">To</span>
                    <code>{shortAddress(RECIPIENT_ADDRESS)}</code>
                  </div>

                  <button
                    className="donate-send-btn"
                    onClick={sendDonation}
                    disabled={status === 'loading'}
                    type="button"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="donate-spinner" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Send {amount} ETH
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ConnectWallet
