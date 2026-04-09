import { Outlet, useLocation } from 'react-router-dom'

const steps = [
  { path: '/onboarding', label: 'Perfil' },
  { path: '/onboarding/carro', label: 'Tu Carro' },
  { path: '/onboarding/camino', label: 'Tu Camino' },
]

export default function OnboardingLayout() {
  const { pathname } = useLocation()
  const currentStep = steps.findIndex((s) => s.path === pathname)
  const progress = currentStep >= 0 ? currentStep : 0

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0a0a] noise-overlay">
      {/* Progress bar */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((step, i) => (
            <div key={step.path} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`h-1 w-full rounded-full transition-colors duration-300 ${
                  i <= progress ? 'bg-[var(--cyan)]' : 'bg-white/[0.06]'
                }`}
              />
              <span
                className={`text-[10px] tracking-wider uppercase transition-colors ${
                  i <= progress ? 'text-[var(--cyan)]' : 'text-white/20'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1 flex flex-col px-5 pb-8">
        <Outlet />
      </div>
    </div>
  )
}
