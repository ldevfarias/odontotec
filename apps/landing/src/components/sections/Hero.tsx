"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { staggerContainer, fadeInUp, slideInFromRight } from "@/lib/animations";
import { User, Users, Building } from "lucide-react";
import { APP_URL } from "@/lib/config";

export function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yFloat = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-background">
            {/* Abstract Background Element */}
            <motion.div
                style={{ y: yBg }}
                className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
            />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Content (Left) - Takes up most space */}
                    <motion.div
                        className="w-full lg:w-[65%] shrink-0"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={fadeInUp} className="mb-6 flex items-center gap-3">
                            <span className="h-1 w-8 bg-primary rounded-full"></span>
                            <span className="text-sm font-medium tracking-widest text-primary uppercase">OdontoEhTec</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="heading-hero mb-8 text-balance"
                        >
                            Sua clínica, <br className="hidden md:block" />
                            <span className="text-primary/90 italic">no ritmo</span> do que você <span className="text-primary italic">eh</span>.
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="body-large max-w-xl mb-12 text-balance"
                        >
                            Tudo o que você precisa em um único lugar. Prontuário, agenda e financeiro com elegância. Feito para dentistas que valorizam precisão.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <a
                                href={`${APP_URL}/register`}
                                className="fill-button w-full sm:w-auto group shadow-lg shadow-primary/20 flex items-center justify-center cursor-pointer"
                            >
                                Testar grátis por 7 dias
                                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                            <button className="ghost-button w-full sm:w-auto">
                                Ver planos
                            </button>
                        </motion.div>

                        {/* Audience Tags */}
                        <motion.div variants={fadeInUp} className="mt-10 pt-8 border-t border-border flex flex-wrap items-center gap-3 text-sm text-muted-foreground w-full">
                            <span className="font-medium text-foreground mr-1">Perfeito para:</span>
                            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium text-xs border border-primary/20 hover:bg-primary/20 transition-colors"><User className="w-3.5 h-3.5" /> Estudantes</span>
                            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium text-xs border border-primary/20 hover:bg-primary/20 transition-colors"><Users className="w-3.5 h-3.5" /> Dentista Solo</span>
                            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium text-xs border border-primary/20 hover:bg-primary/20 transition-colors"><Building className="w-3.5 h-3.5" /> Clínicas</span>
                        </motion.div>
                    </motion.div>

                    {/* Visual (Right) - Tensioned Asymmetry */}
                    <motion.div
                        className="w-full lg:w-[45%] relative"
                        variants={slideInFromRight}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Minimalist Dashboard Interface Mock */}
                        <div className="relative w-full aspect-[4/5] md:aspect-square bg-white rounded-3xl border border-border shadow-2xl overflow-hidden translate-x-0 lg:translate-x-12 z-20">
                            {/* Fake UI Header */}
                            <div className="h-12 md:h-16 border-b border-border flex items-center px-4 md:px-6">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-border" />
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-border" />
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-border" />
                                </div>
                            </div>

                            {/* Fake UI Content */}
                            <div className="p-4 sm:p-8 space-y-5 sm:space-y-8">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-3">
                                        <div className="w-24 h-4 bg-muted rounded-full" />
                                        <div className="w-48 h-10 bg-gray-100 rounded-lg" />
                                    </div>
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="h-28 sm:h-32 bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col justify-between">
                                        <div className="w-8 h-8 rounded-full bg-success/20" />
                                        <div className="w-3/4 h-3 bg-muted rounded-full mt-auto" />
                                        <div className="w-1/2 h-4 bg-gray-300 rounded-full mt-2" />
                                    </div>
                                    <div className="h-28 sm:h-32 bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col justify-between">
                                        <div className="w-8 h-8 rounded-full bg-accent" />
                                        <div className="w-3/4 h-3 bg-muted rounded-full mt-auto" />
                                        <div className="w-1/2 h-4 bg-gray-300 rounded-full mt-2" />
                                    </div>
                                </div>

                                <div className="h-40 sm:h-48 bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5">
                                    {/* Fake Chart lines */}
                                    <div className="w-full flex items-end h-full gap-2 pb-2">
                                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                                                {i === 3 && <div className="w-full h-full bg-primary rounded-t-sm" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Element behind */}
                        <motion.div
                            style={{ y: yFloat }}
                            className="absolute top-1/2 -left-12 -translate-y-1/2 w-48 h-64 bg-primary/10 backdrop-blur-3xl rounded-[2rem] -rotate-6 -z-10 hidden md:block"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
