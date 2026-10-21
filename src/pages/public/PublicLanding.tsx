import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  ArrowRight,
  Check,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Dumbbell,
  Activity,
  Flame,
  ShieldCheck,
} from 'lucide-react'
import { usePlans } from '@/lib/store'
import { Logo } from '@/components/Logo'
import { SITE, IMAGES } from '@/lib/site'
import { mzn } from '@/lib/format'

const NAV = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'treino', label: 'Treino' },
  { id: 'planos', label: 'Planos' },
  { id: 'contacto', label: 'Contacto' },
]

export default function PublicLanding() {
  const navigate = useNavigate()
  const plans = usePlans(true)
  const [menu, setMenu] = useState(false)
  const [heroOk, setHeroOk] = useState(true)
  const [aboutOk, setAboutOk] = useState(true)

  function go(id: string) {
    setMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Cabeçalho */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => go('inicio')}>
            <Logo size={110} />
          </button>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="text-sm font-medium text-slate-300 hover:text-brand">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={() => navigate('/entrar')} className="btn-ghost px-4 py-2 text-sm">Entrar</button>
            <button onClick={() => navigate('/criar-conta')} className="btn-primary px-4 py-2 text-sm">Criar conta</button>
          </div>
          <button className="md:hidden" onClick={() => setMenu(true)}>
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* Menu telemóvel */}
      {menu && (
        <div className="fixed inset-0 z-40 bg-ink-950/95 backdrop-blur-lg md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo size={110} />
            <button onClick={() => setMenu(false)}><X size={26} /></button>
          </div>
          <div className="flex flex-col gap-1 px-5 pt-6">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="display py-3 text-left text-2xl text-slate-200">
                {n.label}
              </button>
            ))}
            <div className="mt-6 space-y-3">
              <button onClick={() => navigate('/entrar')} className="btn-ghost w-full">Entrar</button>
              <button onClick={() => navigate('/criar-conta')} className="btn-primary w-full">Criar conta</button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="inicio" className="relative flex min-h-screen items-center overflow-hidden px-4 pt-16">
        <div className="absolute inset-0 -z-10 bg-ink-950" />
        {heroOk && (
          <img
            src={IMAGES.hero}
            alt=""
            onError={() => setHeroOk(false)}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
          />
        )}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(5,5,7,0.96) 0%, rgba(5,5,7,0.7) 45%, rgba(5,5,7,0.35) 100%), linear-gradient(0deg, rgba(5,5,7,0.95), transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(70% 60% at 85% -10%, rgba(226,255,0,0.16), transparent 60%)',
          }}
        />
        <div className="mx-auto w-full max-w-6xl py-20">
          <p className="display mb-5 inline-block border-l-2 border-brand pl-3 text-xs tracking-[0.25em] text-brand">
            {SITE.tagline}
          </p>
          <h1 className="display text-5xl leading-[0.95] sm:text-7xl md:text-8xl">
            Constrói a tua <span className="text-brand">força.</span>
            <br />
            Abraça o teu poder.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">{SITE.heroSubtitle}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/criar-conta')} className="btn-primary px-6 py-4 text-base">
              Junta-te ao Olympus <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/entrar')} className="btn-ghost border-brand/40 px-6 py-4 text-base text-brand">
              Entrar como membro
            </button>
          </div>
          <div className="mt-16 flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
            Rolar <ChevronDown size={16} className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="mx-auto max-w-6xl px-4 py-24">
        <p className="display mb-4 text-xs tracking-[0.25em] text-brand">— Sobre o Olympus</p>
        <h2 className="display max-w-3xl text-4xl leading-tight sm:text-5xl">
          Não é um ginásio. É uma <span className="text-brand">arena.</span>
        </h2>
        {aboutOk && (
          <img
            src={IMAGES.about}
            alt="Treino no Olympus"
            onError={() => setAboutOk(false)}
            className="mt-8 h-56 w-full rounded-3xl border border-white/10 object-cover sm:h-72"
          />
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <p className="text-slate-300">{SITE.aboutText}</p>
          <p className="text-slate-300">{SITE.aboutText2}</p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4">
          {SITE.stats.map((s) => (
            <div key={s.label} className="border-l-2 border-brand pl-4">
              <p className="display text-3xl text-white sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TREINO */}
      <section id="treino" className="bg-ink-900/60 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <p className="display mb-4 text-xs tracking-[0.25em] text-brand">— O teu treino</p>
          <h2 className="display text-4xl sm:text-5xl">Treina com propósito</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Dumbbell, t: 'Força & Hipertrofia', d: 'Equipamento profissional e planos para ganhares massa e potência.' },
              { icon: Activity, t: 'Cardio & Resistência', d: 'Melhora o fôlego e a condição física com sessões guiadas.' },
              { icon: Flame, t: 'Aulas de grupo', d: 'Treinos em comunidade com instrutores dedicados.' },
            ].map((c) => {
              const Icon = c.icon
              return (
                <div key={c.t} className="card">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold">{c.t}</h3>
                  <p className="mt-1 text-sm text-slate-400">{c.d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-6xl px-4 py-24">
        <p className="display mb-4 text-center text-xs tracking-[0.25em] text-brand">— Planos de adesão</p>
        <h2 className="display text-center text-4xl sm:text-5xl">
          Escolhe o teu <span className="text-brand">compromisso</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-slate-400">{SITE.planNote}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(plans.data ?? []).map((p, i) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-3xl border p-6 ${
                i === 0 ? 'border-brand bg-brand/5 shadow-glow' : 'border-white/10 bg-ink-850'
              }`}
            >
              <p className="display text-xl">{p.name}</p>
              <p className="mt-1 text-xs text-slate-400">{p.duration_days} dias de acesso</p>
              <p className="display mt-5 text-3xl text-brand">{mzn(p.price_mzn)}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {SITE.planPerks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={15} className="text-brand" /> {perk}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/criar-conta')} className="btn-primary mt-6 w-full">
                Junta-te
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="bg-ink-900/60 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="display text-4xl sm:text-5xl">
            Vem treinar <span className="text-brand">connosco</span>
          </h2>
          <p className="mt-4 max-w-xl text-slate-300">{SITE.contactText}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <ContactItem icon={<Phone size={18} />} label="Telefone" value={SITE.phone} />
            <ContactItem icon={<Mail size={18} />} label="Email" value={SITE.email} />
            <ContactItem icon={<MapPin size={18} />} label="Morada" value={SITE.address} />
          </div>
          <button onClick={() => navigate('/criar-conta')} className="btn-primary mt-10 px-6 py-4">
            Junta-te ao Olympus <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo size={120} />
            <p className="mt-4 text-sm text-slate-400">
              Constrói a tua força. Abraça o teu poder. Treino, disciplina e tecnologia num só lugar.
            </p>
          </div>
          <FooterCol title="Navegação" items={NAV.map((n) => n.label)} onItem={(_, i) => go(NAV[i].id)} />
          <div>
            <p className="display mb-3 text-sm tracking-widest text-brand">Contactos</p>
            <p className="text-sm text-slate-400">{SITE.address}</p>
            <p className="mt-1 text-sm text-slate-400">{SITE.phone}</p>
            <p className="mt-1 text-sm text-slate-400">{SITE.email}</p>
          </div>
          <div>
            <p className="display mb-3 text-sm tracking-widest text-brand">Conta</p>
            <FooterLink onClick={() => navigate('/entrar')}>Entrar</FooterLink>
            <FooterLink onClick={() => navigate('/criar-conta')}>Criar conta</FooterLink>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl items-center gap-2 border-t border-white/5 pt-6 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-brand" /> © {new Date().getFullYear()} Olympus Gym · Quelimane, Moçambique
        </div>
      </footer>
    </div>
  )
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function FooterCol({ title, items, onItem }: { title: string; items: string[]; onItem: (s: string, i: number) => void }) {
  return (
    <div>
      <p className="display mb-3 text-sm tracking-widest text-brand">{title}</p>
      {items.map((it, i) => (
        <FooterLink key={it} onClick={() => onItem(it, i)}>{it}</FooterLink>
      ))}
    </div>
  )
}

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="block py-1 text-left text-sm text-slate-400 hover:text-brand">
      {children}
    </button>
  )
}
