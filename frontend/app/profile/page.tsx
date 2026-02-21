"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { api, clearToken } from "../../lib/api";

const inter = Inter({ subsets: ["latin"], display: "swap" });

interface User {
    id: number;
    email: string;
    full_name: string;
    created_at: string;
}

interface Activity {
    id: number;
    topic: string;
    title: string;
    status: string;
    timestamp: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const [userData, userActivities] = await Promise.all([
                    api.getMe(),
                    api.getActivities()
                ]);
                setUser(userData);
                setActivities(userActivities);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [router]);

    const handleSignOut = () => {
        clearToken();
        router.push("/");
    };

    const stats = [
        { label: "Level", value: "Veteran", color: "text-orange-400" },
        { label: "Questions Solved", value: activities.length.toString(), color: "text-neutral-100" },
        { label: "Overall Accuracy", value: activities.length ? `${Math.round((activities.filter(a => a.status === 'Success').length / activities.length) * 100)}%` : "0%", color: "text-emerald-400" },
        { label: "Current Streak", value: activities.length ? "1 Days" : "0 Days", color: "text-yellow-400" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } as any }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } as any }
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-sans ${inter.className}`}>
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-orange-500 animate-spin mb-4" />
                <div className="text-neutral-400 text-sm tracking-widest uppercase">Loading Profile</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={`min-h-screen bg-neutral-950 text-neutral-100 font-sans ${inter.className} relative selection:bg-orange-500/30 selection:text-orange-200 pb-20`}>
            {/* Ambient background glows */}
            <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="h-20 border-b border-neutral-900/50 bg-neutral-950/30 backdrop-blur-md flex items-center px-8 z-10 sticky top-0">
                <div className="flex-1">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
                            <img src="/ECL_LOGO_Sage.png" className="w-8 h-8 rounded-sm" alt="SAGE" />
                        </motion.div>
                        <span className="font-semibold text-xl tracking-wide group-hover:text-orange-400 transition-colors">SAGE</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/about" className="text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">About</Link>
                    <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">Dashboard</Link>
                    <button onClick={handleSignOut} className="text-sm font-medium px-4 py-1.5 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-500 transition-all">Sign Out</button>
                </nav>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
                <motion.div variants={containerVariants} initial="hidden" animate="show">

                    {/* Profile Hero */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center text-3xl shadow-xl">
                            🧑‍💻
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{user.full_name}</h1>
                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                                <span>{user.email}</span>
                                <span>•</span>
                                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    Scholar
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-3xl backdrop-blur-sm relative overflow-hidden group hover:border-neutral-700/80 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-xs uppercase tracking-wide text-neutral-500 font-semibold mb-2">{stat.label}</div>
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Main Grid: Activity vs Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Recent Activity List */}
                        <motion.div variants={itemVariants} className="md:col-span-2 bg-neutral-900/40 border border-neutral-800/60 rounded-3xl p-6 backdrop-blur-sm">
                            <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                                Recent Activity
                                <button className="text-xs font-medium text-orange-400 hover:text-orange-300">View All →</button>
                            </h2>
                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <div className="text-neutral-500 text-sm text-center py-8">No recent activity yet. Start training!</div>
                                ) : (
                                    activities.slice(0, 5).map((act, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm shadow-inner group-hover:bg-neutral-800 transition-colors">
                                                    {act.topic === "Backend" ? "🗄️" : act.topic === "Frontend" ? "💻" : act.topic === "Machine Learning" ? "🧠" : act.topic === "DevOps" ? "⚙️" : "🌐"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm mb-0.5 text-neutral-200">{act.title}</div>
                                                    <div className="text-xs text-neutral-500">{act.topic} • {new Date(act.timestamp).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${act.status === "Success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                act.status === "Partial" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                {act.status}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Focus Areas (Mocked radar/bar chart equivalent) */}
                        <motion.div variants={itemVariants} className="bg-neutral-900/40 border border-neutral-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
                            <h2 className="text-lg font-bold mb-6">Focus Areas</h2>
                            <div className="flex-1 flex flex-col justify-center space-y-5">
                                {[
                                    { label: "Backend", pct: "78%" },
                                    { label: "System Design", pct: "92%" },
                                    { label: "Frontend", pct: "45%" },
                                    { label: "DevOps", pct: "60%" },
                                ].map((focus, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-medium mb-2">
                                            <span className="text-neutral-400">{focus.label}</span>
                                            <span className="text-neutral-200">{focus.pct}</span>
                                        </div>
                                        <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                                            <motion.div
                                                className="h-full bg-orange-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: focus.pct }}
                                                transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
                                <button className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold transition-colors">
                                    Generate Custom Plan
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            </main>
        </div>
    );
}
