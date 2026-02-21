"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { api, setToken } from "../../lib/api";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isLogin) {
                // Login
                const data = await api.login({ email, password });
                setToken(data.access_token);
                router.push("/profile");
            } else {
                // Register
                await api.register({ email, password, full_name: name });
                // Auto-login after register
                const data = await api.login({ email, password });
                setToken(data.access_token);
                router.push("/profile");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } as any },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } as any }
    };

    return (
        <div className={`min-h-screen bg-neutral-950 text-neutral-100 font-sans ${inter.className} relative flex items-center justify-center overflow-hidden selection:bg-orange-500/30 selection:text-orange-200`}>
            {/* Ambient background glows */}
            <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Back button */}
            <Link href="/" className="absolute top-8 left-8 text-neutral-400 hover:text-orange-400 transition-colors flex items-center gap-2 text-sm font-medium z-10 group">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to App
            </Link>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <img src="/ECL_LOGO_Sage.png" className="w-14 h-14 mb-4 drop-shadow-lg" alt="SAGE" />
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-sm text-neutral-400 mt-2">
                        {isLogin ? "Enter your details to access SAGE." : "Join SAGE to track your learning journey."}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle inner noise */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03] pointer-events-none" />

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    key="name"
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5 font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                                        placeholder="Alex Mercer"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5 font-semibold">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                                placeholder="alex@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs uppercase tracking-wide text-neutral-500 font-semibold">Password</label>
                                {isLogin && <a href="#" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Forgot?</a>}
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                        >
                            {isLogin ? "Sign In" : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-neutral-500 relative z-10">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-orange-400 hover:text-orange-300 font-medium transition-colors outline-none"
                        >
                            {isLogin ? "Create one" : "Sign in"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
