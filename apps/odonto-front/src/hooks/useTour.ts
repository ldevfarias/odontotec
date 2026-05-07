'use client';

import { driver } from 'driver.js';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

import { analytics, EVENT_NAMES } from '@/services/analytics.service';

const TOUR_SEEN_KEY = 'odontotec_tour_seen';

export function hasSeenTour(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(TOUR_SEEN_KEY) === 'true';
}

function waitForElement(selector: string, timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

export function useTour() {
  const router = useRouter();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (window.innerWidth < 768) return;

    if (driverRef.current?.isActive()) return;

    localStorage.setItem('sidebar-collapsed', 'false');
    window.dispatchEvent(new CustomEvent('tour:expand-sidebar'));

    let completedAllSteps = false;

    driverRef.current = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.6,
      smoothScroll: true,
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Concluir ✓',
      progressText: '{{current}} de {{total}}',
      onDestroyed: () => {
        localStorage.setItem(TOUR_SEEN_KEY, 'true');
        if (completedAllSteps) {
          analytics.capture(EVENT_NAMES.TOUR_COMPLETED, {});
        } else {
          const step = driverRef.current?.getActiveIndex() ?? 0;
          analytics.capture(EVENT_NAMES.TOUR_DISMISSED, { step });
        }
      },
      steps: [
        {
          element: '[data-tour="clinic-header"]',
          popover: {
            title: '🏥 Sua Clínica',
            description:
              'Este é o painel da sua clínica. Você pode alternar entre clínicas clicando aqui.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="nav-patients"]',
          popover: {
            title: '👥 Pacientes',
            description: 'Aqui você gerencia todos os seus pacientes.',
            side: 'right',
            align: 'start',
            onNextClick: () => {
              router.push('/patients');
              waitForElement('[data-tour="create-patient-btn"]').then(() => {
                driverRef.current?.moveNext();
              });
            },
          },
        },
        {
          element: '[data-tour="create-patient-btn"]',
          popover: {
            title: '➕ Novo Paciente',
            description: 'Clique aqui para cadastrar seu primeiro paciente.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '[data-tour="nav-appointments"]',
          popover: {
            title: '📅 Agendamentos',
            description: 'Neste módulo você controla toda a agenda da clínica.',
            side: 'right',
            align: 'start',
            onNextClick: () => {
              router.push('/agendamentos');
              waitForElement('[data-tour="create-appointment-btn"]').then(() => {
                driverRef.current?.moveNext();
              });
            },
          },
        },
        {
          element: '[data-tour="create-appointment-btn"]',
          popover: {
            title: '🗓️ Novo Agendamento',
            description: 'Crie seu primeiro agendamento e comece a usar o OdontoTec!',
            side: 'left',
            align: 'start',
            onNextClick: () => {
              completedAllSteps = true;
              driverRef.current?.destroy();
            },
          },
        },
      ],
    });

    analytics.capture(EVENT_NAMES.TOUR_STARTED, {});
    driverRef.current.drive();
  }, [router]);

  return { startTour };
}
