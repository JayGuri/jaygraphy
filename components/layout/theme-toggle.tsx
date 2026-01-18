"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10" /> // Placeholder to avoid hydration mismatch
    }

    const isDark = theme === "dark"

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle theme"
        >
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-foreground"
                animate={{ rotate: isDark ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
                {/* Aperture Blades / Sun Rays Concept */}
                <motion.circle
                    cx="12"
                    cy="12"
                    initial={false}
                    animate={{ r: isDark ? 8 : 4 }}
                />
                <motion.path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    initial={false}
                    animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.5 : 1 }}
                />
            </motion.svg>

            {/* Aperture overlay for dark mode - stylized */}
            {isDark && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Could add more complex SVG aperture blades here if needed */}
                </motion.div>
            )}
        </button>
    )
}
