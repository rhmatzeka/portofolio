// @ts-nocheck
import { motion } from 'framer-motion'
import './Certificates.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 }
  }
}

const itemUp = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } }
}

const CertificateCard = ({ certificate }) => (
  <motion.article className="certificate-card" variants={itemUp}>
    <div className="certificate-media">
      {certificate.image ? (
        <img src={certificate.image} alt={certificate.title} loading="lazy" decoding="async" />
      ) : (
        <div className="certificate-placeholder" aria-hidden="true">
          <span>{certificate.title?.slice(0, 1) || 'C'}</span>
        </div>
      )}
    </div>

    <div className="certificate-body">
      <div>
        <span className="certificate-kicker">{certificate.issuer || 'Certificate'}</span>
        <h3>{certificate.title}</h3>
      </div>

      {certificate.description && (
        <p>{certificate.description}</p>
      )}

      <div className="certificate-meta">
        {certificate.issuedAt && <span>{certificate.issuedAt}</span>}
        {certificate.skills?.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      {certificate.credentialUrl && (
        <a
          href={certificate.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="certificate-link"
        >
          View Credential
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  </motion.article>
)

const Certificates = ({ certificates = [] }) => {
  if (!certificates.length) return null

  return (
    <motion.div
      className="certificates-container"
      variants={containerVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.14 }}
    >
      <div className="certificates-header">
        <motion.h1 variants={itemUp} className="section-title">Certificates</motion.h1>
        <motion.p variants={itemUp} className="section-subtitle">
          Verified learning, courses, and achievements.
        </motion.p>
      </div>

      <motion.div className="certificates-grid" variants={containerVariants}>
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Certificates
