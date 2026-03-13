"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, slideInFromRight } from "@/lib/animations";

const steps = [
    {
        number: "01",
        title: "Onboarding Imediato",
        description: "Sem implantação demorada. Crie sua conta, convide sua equipe com um clique e comece a usar no mesmo minuto."
    },
    {
        number: "02",
        title: "Migração Transparente",
        description: "Importe seus pacientes de outros sistemas através de planilhas. Nossa equipe ajuda nos bastidores."
    },
    {
        number: "03",
        title: "Gestão no Piloto Automático",
        description: "A partir do dia 1, a agenda começa a disparar lembretes e o financeiro organiza o que há para receber."
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-card relative z-10 border-t border-border">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    <motion.div
                        className="w-full lg:w-[40%] sticky top-32"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeInUp} className="heading-2 mb-6 text-balance">
                            Desenhado para não precisar de <span className="text-primary italic">manual</span>.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="body-large mb-8">
                            Sistemas antigos exigem horas de treinamento. O OdontoEhTec é tão intuitivo quanto os aplicativos que você já usa no dia a dia.
                        </motion.p>

                        <motion.div variants={fadeInUp}>
                            <div className="w-16 h-1 w-full bg-border rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-primary rounded-full"></div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="w-full lg:w-[60%] flex flex-col gap-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                variants={slideInFromRight}
                                className="flex gap-6 md:gap-8 group"
                            >
                                <div className="shrink-0 flex flex-col items-center">
                                    <span className="font-display text-4xl font-bold text-border group-hover:text-primary transition-colors duration-500">
                                        {step.number}
                                    </span>
                                    {idx !== steps.length - 1 && (
                                        <div className="w-px h-full bg-border mt-4 group-hover:bg-primary/30 transition-colors duration-500" />
                                    )}
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-sans font-bold text-2xl text-foreground mb-3">{step.title}</h3>
                                    <p className="body-regular text-lg text-muted-foreground">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
