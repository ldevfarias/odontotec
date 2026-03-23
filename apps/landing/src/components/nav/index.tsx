"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { APP_URL } from "@/lib/config";

export function Nav() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-background/80 backdrop-blur-md border-b border-border py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-2xl tracking-tighter text-foreground">
                        Odonto<span className="text-primary">Eh</span>Tec
                    </span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="relative py-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
                        Funcionalidades
                    </a>
                    <a href="#how-it-works" className="relative py-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
                        Como funciona
                    </a>
                    <a href="#pricing" className="relative py-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
                        Planos
                    </a>
                </nav>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <a
                        href={`${APP_URL}/login`}
                        className="hidden md:inline-flex bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 py-2 px-6 text-sm font-semibold transition-all rounded-full cursor-pointer"
                    >
                        Fazer login
                    </a>
                    <a
                        href={`${APP_URL}/register`}
                        className="fill-button py-2 px-6 text-sm cursor-pointer"
                    >
                        Começar agora
                    </a>
                </div>
            </div>
        </motion.header>
    );
}
