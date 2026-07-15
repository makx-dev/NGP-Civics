import { motion } from 'framer-motion'

export default function AnimatedCard({ children }) {
  return (
    <motion.section className="w-full max-w-[34rem] rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">
      {children}
    </motion.section>
  )
}
