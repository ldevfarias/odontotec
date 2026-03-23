"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { Check } from "lucide-react";
import { APP_URL } from "@/lib/config";

export function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-24 bg-background relative overflow-hidden">
            {/* Background soft element */}
            <div className="absolute -left-[20%] top-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">

                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    <motion.div
                        className="w-full lg:w-1/2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeInUp} className="heading-hero text-5xl md:text-6xl mb-6">
                            Simples. <br />
                            <span className="text-primary italic">Justo.</span> <br />
                            Definitivo.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="body-large mb-8">
                            Esqueça as calculadoras de licenças. Com o OdontoEhTec, você traz toda a sua equipe para a plataforma por um valor único que não muda.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="space-y-4">
                            {[
                                "Usuários ilimitados inclusos",
                                "Acesso de qualquer dispositivo",
                                "Gestão de fluxo e orçamentos",
                                "Prontuário do paciente completo",
                                "Fluxo financeiro e orçamentos",
                                "Suporte prioritário via WhatsApp"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-primary stroke-[3]" />
                                    </div>
                                    <span className="body-regular">{item}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="w-full lg:w-1/2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                    >
                        {/* The Pricing Card - Editorial style */}
                        <div className="relative p-1 bg-gradient-to-b from-border to-transparent rounded-[2rem] max-w-md mx-auto lg:ml-auto">
                            <div className="bg-card rounded-[1.9rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">

                                {/* Decorative top anchor */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-primary" />

                                <h3 className="font-display text-2xl font-bold mb-2">Plano Standard</h3>
                                <p className="body-small mb-8">Tudo que uma clínica eficiente precisa.</p>

                                <div className="flex items-center gap-2 mb-2 mt-4">
                                    <span className="text-muted-foreground line-through text-lg font-medium">De R$ 80,00</span>
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded border border-primary/20">-37%</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-foreground font-medium text-lg">R$</span>
                                    <span className="font-display text-5xl sm:text-6xl font-bold text-foreground tracking-tighter">49</span>
                                    <span className="text-foreground font-medium text-lg">,99</span>
                                    <span className="body-small ml-1">/mês</span>
                                </div>

                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100 relative overflow-hidden dark:from-green-950/30 dark:to-emerald-950/30 dark:border-emerald-900/50">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8" />
                                    <p className="text-sm text-emerald-800 dark:text-emerald-400 font-bold mb-1">Economia garantida</p>
                                    <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed">
                                        Softwares tradicionais cobram em média ~R$ 150/mês + taxas. Com o Odonto<span className="italic">Eh</span>Tec, você economiza mais de <strong className="font-bold text-emerald-900 dark:text-emerald-300">R$ 1.200 ao ano</strong>.
                                    </p>
                                </div>

                                <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                                    <UsersGroupIcon className="w-6 h-6 text-primary shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-sm text-foreground">Equipe Ilimitada</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Concorrentes cobram por assento. Nós não.</p>
                                    </div>
                                </div>

                                <div className="text-center mb-3">
                                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                                        ✨ 14 dias gratuitos para testar
                                    </span>
                                </div>
                                <a
                                    href={`${APP_URL}/register`}
                                    className="fill-button w-full justify-center group cursor-pointer shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 flex items-center"
                                >
                                    Começar meus 14 dias grátis
                                    <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform inline-block" />
                                </a>
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    Pagamento mensal. Cancele a qualquer momento.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

// Inline SVGs for specialized icons
function UsersGroupIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
    );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    );
}
