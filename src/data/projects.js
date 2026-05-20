export const stackIcons = {
  CSS: 'https://cdn.simpleicons.org/css/663399',
  Docker: 'https://cdn.simpleicons.org/docker/2496ED',
  Express: 'https://cdn.simpleicons.org/express/FFFFFF',
  Ethers: 'https://cdn.simpleicons.org/ethereum/627EEA',
  'Ethers.js': 'https://cdn.simpleicons.org/ethereum/627EEA',
  Figma: 'https://cdn.simpleicons.org/figma',
  Java: 'https://cdn.simpleicons.org/openjdk/FFFFFF',
  JavaScript: 'https://cdn.simpleicons.org/javascript/F7DF1E',
  Laravel: 'https://cdn.simpleicons.org/laravel/FF2D20',
  MySQL: 'https://cdn.simpleicons.org/mysql/4479A1',
  'Next.js': 'https://cdn.simpleicons.org/nextdotjs/FFFFFF',
  'Node.js': 'https://cdn.simpleicons.org/nodedotjs/5FA04E',
  PHP: 'https://cdn.simpleicons.org/php/777BB4',
  PostgreSQL: 'https://cdn.simpleicons.org/postgresql/4169E1',
  Prisma: 'https://cdn.simpleicons.org/prisma/2D3748',
  Python: 'https://cdn.simpleicons.org/python/3776AB',
  React: 'https://cdn.simpleicons.org/react/61DAFB',
  'React Native': 'https://cdn.simpleicons.org/react/61DAFB',
  Solidity: 'https://cdn.simpleicons.org/solidity/FFFFFF',
  Supabase: 'https://cdn.simpleicons.org/supabase/3FCF8E',
  Tailwind: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  TypeScript: 'https://cdn.simpleicons.org/typescript/3178C6',
  'Web3.js': 'https://cdn.simpleicons.org/web3dotjs/F16822'
}

export const stackAliases = {
  css3: 'CSS',
  django: 'Python',
  eth: 'Ethers.js',
  ethereum: 'Ethers.js',
  ethers: 'Ethers.js',
  ethersjs: 'Ethers.js',
  expressjs: 'Express',
  js: 'JavaScript',
  javascript: 'JavaScript',
  laravel: 'Laravel',
  mysql: 'MySQL',
  next: 'Next.js',
  nextjs: 'Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
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
