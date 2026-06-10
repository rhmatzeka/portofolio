const inlineSvgIcon = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const flameIcon = inlineSvgIcon(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="flame-gradient" x1="5" x2="19" y1="22" y2="2" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffb000"/>
      <stop offset="0.5" stop-color="#ff5a1f"/>
      <stop offset="1" stop-color="#ff2d55"/>
    </linearGradient>
  </defs>
  <path fill="url(#flame-gradient)" d="M12.72 2.4c.48 2.95-1.24 4.65-2.92 6.3-1.66 1.63-3.28 3.22-3.28 6.1 0 4 2.74 6.8 6.48 6.8 3.84 0 6.62-2.78 6.62-6.62 0-2.86-1.56-5.18-4.68-6.96.1 1.95-.54 3.35-1.92 4.2.22-1.8-.1-3.34-.96-4.62-.8-1.18-1.06-2.9.66-5.2Z"/>
  <path fill="#fff4b8" d="M12.55 12.48c.54 1.28.26 2.38-.84 3.3-.9.74-1.18 1.62-.84 2.64.24.72.92 1.18 1.78 1.18 1.42 0 2.42-1.02 2.42-2.48 0-1.64-.84-3.18-2.52-4.64Z" opacity="0.9"/>
</svg>
`)

export const stackIcons = {
  CSS: 'https://cdn.simpleicons.org/css/663399',
  Dart: 'https://cdn.simpleicons.org/dart/0175C2',
  Docker: 'https://cdn.simpleicons.org/docker/2496ED',
  Flame: flameIcon,
  Express: 'https://cdn.simpleicons.org/express/FFFFFF',
  Flutter: 'https://cdn.simpleicons.org/flutter/02569B',
  Hardhat: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/hardhat/hardhat-original.svg',
  Ethers: 'https://cdn.simpleicons.org/ethereum/627EEA',
  'Ethers.js': 'https://cdn.simpleicons.org/ethereum/627EEA',
  Ethereum: 'https://cdn.simpleicons.org/ethereum/627EEA',
  Figma: 'https://cdn.simpleicons.org/figma',
  Java: 'https://cdn.simpleicons.org/openjdk/FFFFFF',
  JavaScript: 'https://cdn.simpleicons.org/javascript/F7DF1E',
  Kotlin: 'https://cdn.simpleicons.org/kotlin/7F52FF',
  Laravel: 'https://cdn.simpleicons.org/laravel/FF2D20',
  MySQL: 'https://cdn.simpleicons.org/mysql/4479A1',
  'Next.js': 'https://cdn.simpleicons.org/nextdotjs/FFFFFF',
  'Node.js': 'https://cdn.simpleicons.org/nodedotjs/5FA04E',
  OpenZeppelin: 'https://cdn.simpleicons.org/openzeppelin/4E5EE4',
  PHP: 'https://cdn.simpleicons.org/php/777BB4',
  PostgreSQL: 'https://cdn.simpleicons.org/postgresql/4169E1',
  Prisma: 'https://cdn.simpleicons.org/prisma/2D3748',
  Python: 'https://cdn.simpleicons.org/python/3776AB',
  React: 'https://cdn.simpleicons.org/react/61DAFB',
  'React Native': 'https://cdn.simpleicons.org/react/61DAFB',
  Solidity: 'https://cdn.simpleicons.org/solidity/FFFFFF',
  Sepolia: 'https://cdn.simpleicons.org/ethereum/627EEA',
  Supabase: 'https://cdn.simpleicons.org/supabase/3FCF8E',
  Tailwind: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  TypeScript: 'https://cdn.simpleicons.org/typescript/3178C6',
  Vercel: 'https://cdn.simpleicons.org/vercel/FFFFFF',
  'Web3.js': 'https://cdn.simpleicons.org/web3dotjs/F16822'
}

export const stackAliases = {
  css3: 'CSS',
  dartlang: 'Dart',
  django: 'Python',
  eth: 'Ethers.js',
  ethereum: 'Ethers.js',
  ethers: 'Ethers.js',
  ethersjs: 'Ethers.js',
  expressjs: 'Express',
  flameengine: 'Flame',
  flamegameengine: 'Flame',
  flutterweb: 'Flutter',
  hardhat: 'Hardhat',
  hardhatjs: 'Hardhat',
  js: 'JavaScript',
  javascript: 'JavaScript',
  kt: 'Kotlin',
  laravel: 'Laravel',
  mysql: 'MySQL',
  next: 'Next.js',
  nextjs: 'Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  openzeppelin: 'OpenZeppelin',
  openzeppelincontracts: 'OpenZeppelin',
  oz: 'OpenZeppelin',
  php: 'PHP',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  prisma: 'Prisma',
  py: 'Python',
  python: 'Python',
  react: 'React',
  reactjs: 'React',
  reactnative: 'React Native',
  rn: 'React Native',
  sepoliaethereum: 'Sepolia',
  sepoliatestnet: 'Sepolia',
  solidity: 'Solidity',
  supabase: 'Supabase',
  tailwind: 'Tailwind',
  tailwindcss: 'Tailwind',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  web3: 'Web3.js',
  web3js: 'Web3.js'
}

export const getCanonicalStackName = (tech) => {
  const value = String(tech || '').trim()
  if (!value) return ''

  const directMatch = Object.keys(stackIcons).find((name) => name.toLowerCase() === value.toLowerCase())
  if (directMatch) return directMatch

  const key = value.toLowerCase().replace(/[^a-z0-9]/g, '')
  return stackAliases[key] || value
}

export const getStackIcon = (tech) => {
  const canonicalName = getCanonicalStackName(tech)
  return stackIcons[canonicalName] || ''
}

export const projects = []
