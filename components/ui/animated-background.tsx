"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        // Premium Blue/Cyan Palette
        const colors = [
            { r: 59, g: 130, b: 246 },  // Blue-500
            { r: 6, g: 182, b: 212 },   // Cyan-500
            { r: 37, g: 99, b: 235 },   // Blue-600
            { r: 15, g: 23, b: 41 },    // Dark Navy
        ];

        class Particle {
            x: number;
            y: number;
            radius: number;
            color: { r: number; g: number; b: number };
            velocity: { x: number; y: number };
            alpha: number;

            constructor() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.radius = Math.random() * 200 + 50;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.2,
                };
                this.alpha = Math.random() * 0.1 + 0.05;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(
                    this.x,
                    this.y,
                    0,
                    this.x,
                    this.y,
                    this.radius
                );

                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;

                if (this.x < -this.radius) this.x = w + this.radius;
                if (this.x > w + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = h + this.radius;
                if (this.y > h + this.radius) this.y = -this.radius;

                this.draw();
            }
        }

        const particles: Particle[] = [];
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle());
        }

        let animationId: number;
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);

            // subtle background base
            ctx.fillStyle = "#0A0E17";
            ctx.fillRect(0, 0, w, h);

            particles.forEach((particle) => particle.update());
            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        />
    );
}
