import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'

// Mock data for agents - in production this would come from indexer/subgraph
const MOCK_AGENTS = [
  { id: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12', name: 'AlphaTrader', creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bC21', createdAt: 1704067200000, feesEarned: BigInt('2450000000000000000'), txCount: 1247, status: 'active' },
  { id: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234', name: 'YieldHunter', creator: '0x8ba1f109551bD432803012645Ac136ddd64DBA72', createdAt: 1703548800000, feesEarned: BigInt('1890000000000000000'), txCount: 892, status: 'active' },
  { id: '0x3c4d5e6f7890abcdef1234567890abcdef123456', name: 'ArbitrageBot', creator: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', createdAt: 1702944000000, feesEarned: BigInt('5670000000000000000'), txCount: 3421, status: 'active' },
  { id: '0x4d5e6f7890abcdef1234567890abcdef12345678', name: 'LiquidityProvider', creator: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a', createdAt: 1702339200000, feesEarned: BigInt('890000000000000000'), txCount: 456, status: 'paused' },
  { id: '0x5e6f7890abcdef1234567890abcdef1234567890', name: 'NFTSniper', creator: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', createdAt: 1701734400000, feesEarned: BigInt('3240000000000000000'), txCount: 1876, status: 'active' },
  { id: '0x6f7890abcdef1234567890abcdef123456789012', name: 'DeFiAggregator', creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bC21', createdAt: 1701129600000, feesEarned: BigInt('4120000000000000000'), txCount: 2134, status: 'active' },
  { id: '0x7890abcdef1234567890abcdef12345678901234', name: 'GasOptimizer', creator: '0x8ba1f109551bD432803012645Ac136ddd64DBA72', createdAt: 1700524800000, feesEarned: BigInt('1560000000000000000'), txCount: 789, status: 'inactive' },
  { id: '0x890abcdef1234567890abcdef1234567890123456', name: 'CrossChainBridge', creator: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', createdAt: 1699920000000, feesEarned: BigInt('7890000000000000000'), txCount: 4567, status: 'active' },
]

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    inactive: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  }
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest border rounded font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
      {status}
    </span>
  )
}

function GlowingNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <span className="relative">
      <span className="absolute inset-0 blur-sm text-cyan-400 opacity-50">{value}</span>
      <span className="relative text-cyan-300">{value}</span>
      <span className="text-cyan-500/70">{suffix}</span>
    </span>
  )
}

function AgentCard({ agent, index }: { agent: typeof MOCK_AGENTS[0]; index: number }) {
  const fees = parseFloat(formatEther(agent.feesEarned)).toFixed(4)

  return (
    <div
      className="group relative bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-lg p-4 md:p-5 transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/80"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-mono text-lg text-white group-hover:text-cyan-300 transition-colors">
              {agent.name}
            </h3>
            <a
              href={`https://basescan.org/address/${agent.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              {truncateAddress(agent.id)}
            </a>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Fees Earned</p>
            <p className="font-mono text-xl font-bold">
              <GlowingNumber value={fees} suffix=" ETH" />
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Transactions</p>
            <p className="font-mono text-xl font-bold text-white">
              {agent.txCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
            <a
              href={`https://basescan.org/address/${agent.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-zinc-400 hover:text-cyan-400 transition-colors"
            >
              {truncateAddress(agent.creator)}
            </a>
          </div>
          <span className="text-[10px] text-zinc-600">{formatDate(agent.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

function StatsBar({ agents }: { agents: typeof MOCK_AGENTS }) {
  const totalFees = agents.reduce((acc, a) => acc + a.feesEarned, BigInt(0))
  const totalTx = agents.reduce((acc, a) => acc + a.txCount, 0)
  const activeCount = agents.filter(a => a.status === 'active').length

  const stats = [
    { label: 'Total Agents', value: agents.length.toString() },
    { label: 'Active', value: activeCount.toString() },
    { label: 'Total Fees', value: `${parseFloat(formatEther(totalFees)).toFixed(2)} ETH` },
    { label: 'Transactions', value: totalTx.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 text-center animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
          <p className="font-mono text-xl md:text-2xl font-bold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

function Header() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-lg bg-cyan-500/20 blur-lg opacity-50" />
          </div>
          <div>
            <h1 className="font-mono text-sm md:text-lg font-bold text-white tracking-tight">BASE AGENTS</h1>
            <p className="font-mono text-[10px] md:text-xs text-zinc-500 hidden sm:block">
              {time.toLocaleTimeString()} UTC | Chain: 8453
            </p>
          </div>
        </div>

        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      </div>
    </header>
  )
}

function LandingContent() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div className="absolute -inset-4 rounded-3xl bg-cyan-500/10 blur-2xl" />
      </div>

      <h2 className="font-mono text-2xl md:text-4xl font-bold text-white mb-4">
        Connect to Explore
      </h2>
      <p className="font-mono text-sm md:text-base text-zinc-400 max-w-md mb-8">
        View all autonomous agents deployed on Base chain and track launcher fees earned in real-time
      </p>

      <div className="flex flex-col items-center gap-4">
        <ConnectButton />
        <p className="font-mono text-xs text-zinc-600">
          Powered by Base L2
        </p>
      </div>
    </div>
  )
}

function AgentsGrid() {
  const { address } = useAccount()
  const [filter, setFilter] = useState<'all' | 'active' | 'mine'>('all')

  const filteredAgents = MOCK_AGENTS.filter(agent => {
    if (filter === 'active') return agent.status === 'active'
    if (filter === 'mine') return agent.creator.toLowerCase() === address?.toLowerCase()
    return true
  })

  return (
    <div className="animate-fade-in">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['all', 'active', 'mine'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-lg border transition-all duration-200 ${
              filter === f
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {f === 'mine' ? 'My Agents' : f}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-zinc-600">
          {filteredAgents.length} agents
        </span>
      </div>

      {/* Stats */}
      <StatsBar agents={filteredAgents} />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="font-mono text-zinc-500">No agents found</p>
        </div>
      )}
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-16 pb-6 text-center">
      <p className="font-mono text-[10px] md:text-xs text-zinc-600">
        Requested by{' '}
        <a
          href="https://twitter.com/Git_Bankr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-cyan-400 transition-colors"
        >
          @Git_Bankr
        </a>
        {' '}&middot;{' '}
        Built by{' '}
        <a
          href="https://twitter.com/clonkbot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-cyan-400 transition-colors"
        >
          @clonkbot
        </a>
      </p>
    </footer>
  )
}

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="relative pt-24 md:pt-28 px-4 md:px-6 max-w-7xl mx-auto">
        {isConnected ? <AgentsGrid /> : <LandingContent />}
        <Footer />
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default App
