"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function AboutPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 } as any,
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 120, damping: 20 } },
    };

    const features = [
        {
            title: "Adaptive Learning",
            desc: "SAGE dynamically generates questions based on your specific difficulty level and chosen technology, ensuring you're always challenged just right.",
            icon: "🧠",
        },
        {
            title: "Real-time Verification",
            desc: "Instant feedback on your code and architectures with live preview metrics, simulating actual production environments.",
            icon: "⚡",
        },
        {
            title: "Infinite Knowledge",
            desc: "Using the power of large language models, the catalog of questions is practically limitless and perfectly tailored to your needs.",
            icon: "🌌",
        },
    ];

    return (
        <div className={`min-h-screen bg-neutral-950 text-neutral-100 font-sans ${inter.className} relative overflow-hidden selection:bg-orange-500/30 selection:text-orange-200`}>
            {/* Ambient background glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-10 border-b border-neutral-900/50 bg-neutral-950/30 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
                        <img src="/ECL_LOGO_Sage.png" className="w-8 h-8 rounded-sm" alt="SAGE" />
                    </motion.div>
                    <span className="font-semibold text-xl tracking-wide group-hover:text-orange-400 transition-colors">SAGE</span>
                </Link>
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/80 hover:border-orange-500/50 hover:bg-neutral-800 text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,0,0,0)] hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to App
                    </motion.button>
                </Link>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-24 px-6 relative z-10 max-w-5xl mx-auto flex flex-col items-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="w-full"
                >
                    {/* Hero Section */}
                    <div className="text-center mb-24 mt-12">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            The Future of Learning
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
                            Meet <span className="text-orange-500 bg-none">SAGE</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            SAGE is an intelligent, dynamic learning platform designed to bridge the gap between theoretical knowledge and practical execution. It generates highly contextual, adaptive technical questions to elevate your skills.
                        </motion.p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                                className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-md relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="text-4xl mb-6 bg-neutral-950 w-16 h-16 rounded-2xl flex items-center justify-center border border-neutral-800 shadow-inner">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-neutral-100">{feature.title}</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mission / Footer CTA */}
                    <motion.div variants={itemVariants} className="relative rounded-3xl p-10 md:p-16 overflow-hidden border border-neutral-800 bg-neutral-900/40 text-center">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-orange-600/10" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Built for Continuous Growth</h2>
                            <p className="text-md text-neutral-400 mb-10 leading-relaxed">
                                Whether you're a high school student learning the ropes or a veteran engineer honing your systems design expertise, SAGE adapts to your exact learning boundary to keep you progressing.
                            </p>
                            <Link href="/">
                                <button className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] active:scale-95">
                                    Start Learning Now
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                </motion.div>
            </main>
        </div>
    );
}
