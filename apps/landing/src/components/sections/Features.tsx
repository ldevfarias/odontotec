'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
  Users,
  LayoutDashboard,
  Calendar,
  Mail,
  FileText,
  ClipboardList,
  PenTool,
  Image as ImageIcon,
  Wallet,
  Plus,
} from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Equipe Ilimitada',
    description: 'Cadastre quantos usuários precisar. Sem pegadinhas, sem custos por assento.',
    colSpan: 'md:col-span-2 lg:col-span-2',
    highlight: true,
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-foreground" />,
    title: 'Gestão Visual',
    description: 'Dashboard limpo que te diz exatamente o que precisa de atenção hoje.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: <Calendar className="w-6 h-6 text-foreground" />,
    title: 'Agenda Inteligente',
    description: 'Crie, mova e remova agendamentos em segundos.',
    colSpan: 'md:col-span-2 lg:col-span-1',
  },
  {
    icon: <FileText className="w-6 h-6 text-foreground" />,
    title: 'Prontuário Rápido',
    description: 'Acesse o histórico clínico do paciente sem perder o contato visual.',
    colSpan: 'md:col-span-1 lg:col-span-2',
  },
  {
    icon: <Mail className="w-6 h-6 text-foreground" />,
    title: 'Comunicação Auto',
    description: 'Lembretes proativos por email para reduzir suas faltas.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: <ClipboardList className="w-6 h-6 text-foreground" />,
    title: 'Histórico Completo',
    description: 'Evolução do tratamento documentada com rigor e facilidade.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: <ImageIcon className="w-6 h-6 text-foreground" />,
    title: 'Galeria de Imagens',
    description: 'Armazene rx e fotos pré/pós tratamento lado a lado.',
    colSpan: 'md:col-span-1 lg:col-span-2',
  },
  {
    icon: <PenTool className="w-6 h-6 text-foreground" />,
    title: 'Receituário Padrão',
    description: 'Emita receitas e atestados com templates salvos.',
    colSpan: 'md:col-span-1 lg:col-span-1',
  },
  {
    icon: <Wallet className="w-6 h-6 text-foreground" />,
    title: 'Fluxo e Orçamentos',
    description: 'Controle financeiro que não exige diploma em contabilidade.',
    colSpan: 'md:col-span-2 lg:col-span-1',
  },
];

export function Features() {
  const [showTeamPopover, setShowTeamPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowTeamPopover(false);
      }
    }
    if (showTeamPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTeamPopover]);

  return (
    <section id="features" className="py-16 md:py-24 bg-card relative z-10 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          className="max-w-3xl mb-8 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="heading-2 mb-4">
            Projetado exclusivamente para o <br className="hidden md:block" />
            <span className="text-primary italic">dentista moderno</span>.
          </motion.h2>
          <motion.p variants={fadeInUp} className="body-large">
            O OdontoEhTec foca no que importa: otimizar seu tempo clínico e organizar seu negócio.
            Zero distrações, máxima eficiência.
          </motion.p>
        </motion.div>

        {/* Bento/Editorial Asymmetric Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`p-6 md:p-8 rounded-3xl border transition-colors ${
                feature.highlight
                  ? 'bg-primary/5 border-primary/20 hover:border-primary/40 col-span-1'
                  : 'bg-background border-border hover:border-gray-300 col-span-1'
              } ${feature.colSpan}`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`inline-flex p-3 rounded-2xl ${feature.highlight ? 'bg-primary/10' : 'bg-gray-50'}`}
                  >
                    {feature.icon}
                  </div>
                  {feature.highlight && (
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border-2 border-background shadow-sm">
                        DR
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border-2 border-background shadow-sm">
                        MA
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border-2 border-background shadow-sm">
                        LC
                      </div>
                      <div
                        ref={popoverRef}
                        className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border-2 border-background shadow-sm z-20 hover:scale-110 transition-transform cursor-pointer relative"
                        onClick={() => setShowTeamPopover(!showTeamPopover)}
                      >
                        <Plus className="w-5 h-5 text-primary" strokeWidth={2.5} />
                        <AnimatePresence>
                          {showTeamPopover && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className="absolute top-full mt-4 right-0 md:left-1/2 md:right-auto md:-translate-x-[20%] w-[260px] md:w-[280px] origin-top-right md:origin-top bg-card border border-border rounded-2xl shadow-2xl p-5 z-50 text-left cursor-default ring-1 ring-black/5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="absolute -top-2 right-4 md:left-[20%] md:right-auto md:-translate-x-1/2 w-4 h-4 bg-card border-t border-l border-border rotate-45" />
                              <h4 className="font-bold text-sm text-foreground mb-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                Nos concorrentes
                              </h4>
                              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                Limitam você a <strong>1-3 agendas</strong> nos planos e cobram a
                                mais por usuários extras.
                              </p>
                              <div className="w-full h-px bg-border mb-4" />
                              <h4 className="font-bold text-sm text-primary mb-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                Na Odonto<span className="italic">Eh</span>Tec
                              </h4>
                              <p className="text-xs text-foreground font-medium leading-relaxed">
                                Agendas e profissionais <strong>ilimitados</strong> no plano
                                Standard. Cresça sua clínica sem barreiras ou custos escondidos.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <h3
                    className={`font-sans font-bold mb-2 ${feature.highlight ? 'text-primary text-2xl' : 'text-foreground text-xl'}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="body-regular text-sm">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
