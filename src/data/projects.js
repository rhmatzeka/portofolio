import nationchainImage from '../assets/images/nationchain-preview.jpg'
import walletEthereumImage from '../assets/images/WalletEthereum.jpeg'
import simRestoImage from '../assets/images/arjiresto-preview.jpg'
import banbukStoreImage from '../assets/images/banbukstore-preview.jpg'

export const stackIcons = {
  CSS: 'https://cdn.simpleicons.org/css/663399',
  Ethers: 'https://cdn.simpleicons.org/ethereum/627EEA',
  'Ethers.js': 'https://cdn.simpleicons.org/ethereum/627EEA',
  JavaScript: 'https://cdn.simpleicons.org/javascript/F7DF1E',
  MySQL: 'https://cdn.simpleicons.org/mysql/4479A1',
  PHP: 'https://cdn.simpleicons.org/php/777BB4',
  React: 'https://cdn.simpleicons.org/react/61DAFB',
  'React Native': 'https://cdn.simpleicons.org/react/61DAFB',
  Solidity: 'https://cdn.simpleicons.org/solidity/FFFFFF',
  TypeScript: 'https://cdn.simpleicons.org/typescript/3178C6',
  'Web3.js': 'https://cdn.simpleicons.org/web3dotjs/F16822'
}

export const projects = [
  {
    id: 1,
    title: 'NationChain',
    tech: 'BLOCKCHAIN \\ WEB3',
    desc: 'A decentralized blockchain platform for national identity and governance systems with secure smart contracts.',
    fullDesc: 'NationChain is a comprehensive blockchain solution designed for national-level identity management and governance. Built with Solidity smart contracts, it provides secure, transparent, and immutable record-keeping for government services. The platform features decentralized identity verification, voting systems, and document management with end-to-end encryption.',
    stack: ['Solidity', 'Web3.js', 'React'],
    image: nationchainImage,
    imageVariant: 'desktop-shot',
    github: 'https://github.com/rhmatzeka/nationchain',
    demo: '#'
  },
  {
    id: 2,
    title: 'Mobile Wallet Ethereum',
    tech: 'MOBILE \\ ETH',
    desc: 'Mobile cryptocurrency wallet app for Ethereum with secure transaction management and multi-chain support.',
    fullDesc: 'A feature-rich mobile wallet application built with React Native for managing Ethereum and ERC-20 tokens. Includes biometric authentication, QR code scanning, transaction history, real-time price tracking, and support for multiple networks including mainnet and testnets. Implements secure key storage using device encryption.',
    stack: ['React Native', 'Ethers.js', 'TypeScript'],
    image: walletEthereumImage,
    imageVariant: 'phone-shot',
    github: 'https://github.com/rhmatzeka/MobileAppsWalletEthereum',
    demo: '#'
  },
  {
    id: 3,
    title: 'Arji Resto',
    tech: 'WEB \\ RESTAURANT',
    desc: 'Restaurant website with menu browsing, location info, contact flow, and reservation-focused landing experience.',
    fullDesc: 'Arji Resto is a modern restaurant website designed to showcase food and beverage offerings with a clean landing page, menu navigation, location details, contact access, and reservation entry points. The interface focuses on strong food visuals, simple navigation, and a polished customer-facing experience.',
    stack: ['React', 'CSS', 'JavaScript'],
    image: simRestoImage,
    imageVariant: 'desktop-shot',
    github: 'https://github.com/rhmatzeka/SIMResto.git',
    demo: '#'
  },
  {
    id: 4,
    title: 'Banbuk Store',
    tech: 'WEB \\ CATALOG',
    desc: 'Product catalog platform for CV Banbuk Mandiri Jaya with inquiry and payment-ready customer flow.',
    fullDesc: 'Banbuk Store is a company profile and product catalog platform for CV Banbuk Mandiri Jaya. It presents the business with a polished landing page, catalog browsing flow, inquiry entry points, and payment-ready interactions for a professional customer experience.',
    stack: ['React', 'MySQL', 'PHP'],
    image: banbukStoreImage,
    imageVariant: 'desktop-shot',
    github: 'https://github.com/rhmatzeka/CVBanbukStore',
    demo: '#'
  }
]
