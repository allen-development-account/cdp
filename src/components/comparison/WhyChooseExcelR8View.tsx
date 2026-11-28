import React, { useRef, useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Compass,
  ExternalLink,
  LayoutGrid,
  Minimize2,
  ShieldCheck,
  Smile,
  Sparkles
} from 'lucide-react';

type ScreenView = 'overview' | 'technical';
type TechCategory =
  | 'all'
  | 'schemas'
  | 'identity'
  | 'ingestion'
  | 'audiences'
  | 'governance'
  | 'warehouses';

interface EverydayAdvantage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface QuickComparisonRow {
  topic: string;
  adobe: string;
  xlr8: string;
}

interface TechnicalComparisonRow {
  id: string;
  category: Exclude<TechCategory, 'all'>;
  categoryLabel: string;
  capability: string;
  adobe: string;
  xlr8: string;
  difference: string;
  tab: string;
  tabLabel: string;
}

const EVERYDAY_ADVANTAGES: EverydayAdvantage[] = [
  {
    id: 'easy-ui',
    title: 'Easy-to-Use Interface',
    description:
      'Clean layouts and clear headings mean you always know where things live—no hunting through buried menus.',
    icon: LayoutGrid
  },
  {
    id: 'beginner-friendly',
    title: 'Friendly for Beginners',
    description:
      'Step-by-step flows guide new team members from bringing in data to building audiences without specialist training.',
    icon: Compass
  },
  {
    id: 'less-clutter',
    title: 'Less Visual Clutter',
    description:
      'Each screen focuses only on the task in front of you, keeping crowded panels and confusing jargon out of the way.',
    icon: Minimize2
  },
  {
    id: 'better-ux',
    title: 'Smoother Daily Work',
    description:
      'Plain-language labels, instant previews, and fewer clicks turn slow multi-screen chores into calm everyday workflows.',
    icon: Smile
  }
];

const QUICK_COMPARISON_ROWS: QuickComparisonRow[] = [
  {
    topic: 'Learning Curve',
    adobe: 'Weeks of specialist training',
    xlr8: 'Easy for beginners on day one'
  },
  {
    topic: 'Screen Clutter',
    adobe: 'Dense menus and nested panels',
    xlr8: 'Clean, focused workspace'
  },
  {
    topic: 'Everyday Workflows',
    adobe: 'Multi-screen manual setup',
    xlr8: 'Clear step-by-step guidance'
  },
  {
    topic: 'Labels & Language',
    adobe: 'Heavy technical terminology',
    xlr8: 'Plain-language controls'
  },
  {
    topic: 'Getting Started',
    adobe: 'Long consulting-led rollout',
    xlr8: 'Ready to explore immediately'
  }
];

const TECH_CATEGORIES: { id: TechCategory; label: string }[] = [
  { id: 'all', label: 'All Areas' },
  { id: 'schemas', label: 'Data & Schemas' },
  { id: 'identity', label: 'Identity' },
  { id: 'ingestion', label: 'Ingestion' },
  { id: 'audiences', label: 'Audiences' },
  { id: 'governance', label: 'Privacy (DULE)' },
  { id: 'warehouses', label: 'Warehouses' }
];

const TECHNICAL_ROWS: TechnicalComparisonRow[] = [
  {
    id: 'xdm_schemas',
    category: 'schemas',
    categoryLabel: 'Data & Schemas',
    capability: 'XDM Schemas',
    adobe: 'Rigid multi-step schema wizard',
    xlr8: 'Full XDM parity with guided editor',
    difference: 'Same standard, faster setup',
    tab: 'schemas',
    tabLabel: 'Schemas'
  },
  {
    id: 'identity_graph',
    category: 'identity',
    categoryLabel: 'Identity',
    capability: 'Identity Graph',
    adobe: 'Backend-only graph processing',
    xlr8: 'Visual graph with match scores',
    difference: 'Clear view of linked profiles',
    tab: 'identities',
    tabLabel: 'Identity Graph'
  },
  {
    id: 'event_ingestion',
    category: 'ingestion',
    categoryLabel: 'Ingestion',
    capability: 'Event Streaming & QA',
    adobe: 'Requires external proxy tools',
    xlr8: 'Built-in live payload validation',
    difference: 'Verify events inside the app',
    tab: 'ingestion',
    tabLabel: 'Ingestion'
  },
  {
    id: 'audience_overlap',
    category: 'audiences',
    categoryLabel: 'Audiences',
    capability: 'Audience Overlap',
    adobe: 'Static 2-way overlap metrics',
    xlr8: 'Visual Venn + 1-click exclusions',
    difference: 'Prevent repeat messaging quickly',
    tab: 'audience_overlap',
    tabLabel: 'Overlap'
  },
  {
    id: 'dule_privacy',
    category: 'governance',
    categoryLabel: 'Privacy (DULE)',
    capability: 'DULE Privacy Labels',
    adobe: 'Job-level violation codes',
    xlr8: 'Full C/I/S/R rules + visual gates',
    difference: 'Clear policy checks before export',
    tab: 'governance',
    tabLabel: 'Governance'
  },
  {
    id: 'cloud_warehouses',
    category: 'warehouses',
    categoryLabel: 'Warehouses',
    capability: 'Cloud Warehouses',
    adobe: 'Paid add-on with extra setup',
    xlr8: 'Native zero-copy SQL pushdown',
    difference: 'No duplicate storage costs',
    tab: 'federated_composition',
    tabLabel: 'Data Mesh'
  },
  {
    id: 'rollout_speed',
    category: 'schemas',
    categoryLabel: 'Data & Schemas',
    capability: 'Sandbox Readiness',
    adobe: '90–270 day rollout cycles',
    xlr8: 'Ready in hours with live sandboxes',
    difference: 'Faster team onboarding',
    tab: 'get_started',
    tabLabel: 'Get Started'
  }
];

export const WhyChooseExcelR8View: React.FC = () => {
  const { setActiveTab } = useCDP();
  const [activeScreen, setActiveScreen] = useState<ScreenView>('overview');
  const [techCategory, setTechCategory] = useState<TechCategory>('all');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const openScreen = (screen: ScreenView) => {
    setActiveScreen(screen);
    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const filteredTechnicalRows =
    techCategory === 'all'
      ? TECHNICAL_ROWS
      : TECHNICAL_ROWS.filter((row) => row.category === techCategory);

  if (activeScreen === 'technical') {
    return (
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto bg-gradient-to-b from-[#F4F7FB] via-[#F2F4F7] to-[#EAEEF5]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-14 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PageBackButton
              customLabel="Back to Why Choose XLR8"
              onCustomBack={() => openScreen('overview')}
              showForward={false}
            />
            <button
              type="button"
              onClick={() => setActiveTab('get_started')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#1473E6] bg-white border border-[#D4E2F6] hover:border-[#1473E6] hover:bg-[#F5F9FF] shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Try Guided Walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2245] via-[#103A76] to-[#146EE0] text-white p-6 sm:p-9 shadow-[0_16px_40px_-14px_rgba(12,42,88,0.42)] border border-[#1E4F96]/60">
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#4FA3FF]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-12 w-64 h-64 rounded-full bg-[#1473E6]/25 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9BC4FF] mb-2">
                Technical Comparison
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Adobe RT-CDP vs. XLR8 CDP
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#D9E6FA] max-w-2xl leading-relaxed">
                A crisp, side-by-side summary of core platform capabilities—kept concise so you can compare key differences in seconds.
              </p>

              <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-2">
                {TECH_CATEGORIES.map((cat) => {
                  const selected = techCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTechCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                        selected
                          ? 'bg-white text-[#0F2A54] border-white shadow-sm'
                          : 'bg-white/10 text-[#E6EFFC] border-white/20 hover:bg-white/20 hover:border-white/35'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#DCE3EE] rounded-2xl overflow-hidden shadow-[0_10px_30px_-12px_rgba(15,23,42,0.1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#0C274E] via-[#123D7A] to-[#145BB8] text-xs font-semibold uppercase tracking-wider text-white">
                    <th className="px-6 py-4">Capability</th>
                    <th className="px-6 py-4 text-[#C9DCFA]">Adobe RT-CDP</th>
                    <th className="px-6 py-4 text-white">XLR8 CDP</th>
                    <th className="px-6 py-4 text-[#C9DCFA]">Key Difference</th>
                    <th className="px-6 py-4 text-right text-[#C9DCFA]">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EEF5] text-sm">
                  {filteredTechnicalRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#F7FAFF] transition-colors"
                    >
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-[#0F172A]">{row.capability}</div>
                        <div className="text-xs text-[#64748B] mt-0.5">{row.categoryLabel}</div>
                      </td>
                      <td className="px-6 py-4 align-middle text-[#475569]">
                        {row.adobe}
                      </td>
                      <td className="px-6 py-4 align-middle font-medium text-[#0F172A] bg-[#F8FBFF]/80">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#E6F0FD] text-[#1473E6] flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span>{row.xlr8}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-[#334155]">
                        {row.difference}
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab(row.tab)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1473E6] bg-[#EFF6FF] hover:bg-[#1473E6] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{row.tabLabel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-white via-[#F9FBFF] to-[#F1F6FE] border border-[#D4DFEE] rounded-2xl px-6 py-5 shadow-[0_6px_22px_-10px_rgba(15,23,42,0.08)]">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Want to return to the overview?
              </p>
              <p className="text-xs text-[#525B69] mt-0.5">
                Go back to see how XLR8 simplifies day-to-day workflows for every team member.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openScreen('overview')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#1473E6] hover:text-[#1473E6] shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Why Choose XLR8</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto bg-gradient-to-b from-[#F4F7FB] via-[#F2F4F7] to-[#EAEEF5]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-14 space-y-9">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageBackButton fallbackTab="home" fallbackLabel="Home" />
          <button
            type="button"
            onClick={() => setActiveTab('get_started')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#1473E6] bg-white border border-[#D4E2F6] hover:border-[#1473E6] hover:bg-[#F5F9FF] shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Start Guided Walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Elevated Corporate Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2245] via-[#103A76] to-[#146EE0] text-white p-7 sm:p-11 shadow-[0_18px_45px_-16px_rgba(12,42,88,0.45)] border border-[#1E4F96]/60">
          <div className="pointer-events-none absolute -top-28 -right-20 w-80 h-80 rounded-full bg-[#4FA3FF]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 w-72 h-72 rounded-full bg-[#1473E6]/25 blur-3xl" />

          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9BC4FF] mb-2.5">
              Simple by Design
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Why Choose XLR8 CDP Over Adobe CDP?
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#DCE8FA] leading-relaxed">
              Customer data platforms should feel clear and approachable—not overwhelming. XLR8 brings everything into a calmer, cleaner workspace so anyone on your team can get started without heavy training.
            </p>
          </div>

          <div className="relative mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/12 ring-1 ring-white/20 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Easy for Beginners</p>
                <p className="text-xs text-[#C8DAF6] mt-0.5">Adapt quickly with guided flows.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/12 ring-1 ring-white/20 text-white flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ready in Minutes</p>
                <p className="text-xs text-[#C8DAF6] mt-0.5">Skip months of complex setup.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/12 ring-1 ring-white/20 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Calm &amp; Trustworthy</p>
                <p className="text-xs text-[#C8DAF6] mt-0.5">Full privacy clarity without guesswork.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Everyday UX Advantages */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Designed Around Everyday Ease of Use
            </h2>
            <p className="text-sm text-[#525B69] mt-1">
              Focus on your customers instead of wrestling with crowded screens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EVERYDAY_ADVANTAGES.map((item, idx) => {
              const Icon = item.icon;
              const numberLabel = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#CBD7E8] bg-white shadow-[0_12px_30px_-14px_rgba(15,35,70,0.16)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-14px_rgba(20,115,230,0.24)] hover:border-[#93B8E8] transition-all duration-200 flex flex-col"
                >
                  <div className="relative px-6 py-4 bg-gradient-to-r from-[#0B2347] via-[#123D7A] to-[#1460C4] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white/15 ring-1 ring-white/25 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-base font-semibold text-white tracking-tight truncate">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold tabular-nums tracking-wider text-[#BBD4FA]/90 shrink-0">
                      {numberLabel}
                    </span>
                  </div>

                  <div className="relative flex-1 px-6 py-5 bg-gradient-to-br from-white via-white to-[#F6FAFF]">
                    <Icon className="pointer-events-none absolute -bottom-3 -right-3 w-24 h-24 text-[#1473E6]/[0.05] group-hover:text-[#1473E6]/[0.08] transition-colors" />
                    <p className="relative text-sm text-[#334155] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Crisp Usability Comparison Table */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Everyday Experience at a Glance
            </h2>
            <p className="text-sm text-[#525B69] mt-1">
              A quick look at how the two platforms feel to use day to day.
            </p>
          </div>

          <div className="bg-white border border-[#DCE3EE] rounded-2xl overflow-hidden shadow-[0_10px_30px_-12px_rgba(15,23,42,0.1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#0C274E] via-[#123D7A] to-[#145BB8] text-xs font-semibold uppercase tracking-wider text-white">
                    <th className="px-6 py-4">What Matters</th>
                    <th className="px-6 py-4 text-[#C9DCFA]">Adobe CDP</th>
                    <th className="px-6 py-4 text-white">XLR8 CDP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EEF5] text-sm">
                  {QUICK_COMPARISON_ROWS.map((row) => (
                    <tr key={row.topic} className="hover:bg-[#F7FAFF] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">
                        {row.topic}
                      </td>
                      <td className="px-6 py-4 text-[#475569]">
                        {row.adobe}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#0F172A] bg-[#F8FBFF]/80">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#E6F0FD] text-[#1473E6] flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span>{row.xlr8}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottom Technical Transition */}
        <section className="bg-gradient-to-r from-white via-[#F9FBFF] to-[#EFF5FF] border border-[#D4DFEE] rounded-2xl p-6 sm:p-8 shadow-[0_8px_26px_-10px_rgba(15,23,42,0.08)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Want to see the technical breakdown?
            </h2>
            <p className="mt-1.5 text-sm text-[#475569] leading-relaxed">
              We keep technical specifications on a dedicated screen so this overview stays clean and easy to read.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => openScreen('technical')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#1473E6] to-[#0E56B4] hover:from-[#1265CC] hover:to-[#0B4799] shadow-md shadow-[#1473E6]/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore the technical comparison</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
