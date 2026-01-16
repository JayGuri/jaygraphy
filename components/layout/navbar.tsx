"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

const navItems = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Map", href: "/map" },
    { name: "Favorites", href: "/favorites" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm" />

            <div className="container relative mx-auto px-4 h-20 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tighter hover:text-primary transition-colors flex items-center gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
                        JAYGRAPHY
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative text-sm font-medium transition-all hover:text-blue-400",
                                    isActive ? "text-blue-400" : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-[29px] left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/upload">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/5"
                            title="Upload Photos"
                        >
                            <Upload className="w-5 h-5" />
                        </motion.button>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
