'use client';

import { motion } from 'framer-motion';
import {
  Code2,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const DEVELOPER = {
  name: 'Alfe Caesar Lagas',
  title: 'Front-end Web Developer & Dota 2 Enthusiast',
  bio: 'Passionate about building beautiful, performant web applications. DotaPulse was created to bring pro-level analytics to every player — clean data, smooth UX, and zero clutter.',
  website: 'https://alfecaesar-portfolio2026.vercel.app/',
  github: 'https://github.com/alfecaesar',
  linkedin: 'https://www.linkedin.com/in/alfe-caesar-l-24663535/',
  email: 'alfecaesar@gmail.com',
};

const TECH_STACK = [
  { name: 'Next.js 14', desc: 'React framework with App Router' },
  { name: 'TypeScript', desc: 'Type-safe development' },
  { name: 'Tailwind CSS', desc: 'Utility-first styling' },
  { name: 'TanStack Query', desc: 'Data fetching & caching' },
  { name: 'Recharts', desc: 'Composable charting' },
  { name: 'Framer Motion', desc: 'Smooth animations' },
  { name: 'shadcn/ui', desc: 'Accessible components' },
  { name: 'OpenDota API', desc: 'Dota 2 match data' },
];

const SOCIAL_LINKS = [
  { href: DEVELOPER.website, label: 'Website', icon: Globe },
  { href: DEVELOPER.github, label: 'GitHub', icon: Github },
  { href: DEVELOPER.linkedin, label: 'LinkedIn', icon: Linkedin },
  { href: `mailto:${DEVELOPER.email}`, label: 'Email', icon: Mail },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="About DotaPulse"
        description="Real-time Dota 2 analytics built for players who want the edge."
        icon={Activity}
      />

      {/* Developer card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/30">
            <Code2 className="h-12 w-12 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {DEVELOPER.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-primary">
              {DEVELOPER.title}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {DEVELOPER.bio}
            </p>

            {/* Social links */}
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-hover glass inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                    <ExternalLink className="h-3 w-3 text-muted-foreground/60" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tech stack */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Built With
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
              className="rounded-lg border border-border/40 bg-muted/20 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{tech.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data attribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Data Source
        </h3>
        <p className="text-sm text-muted-foreground">
          All match data, hero statistics, and player profiles are provided by the{' '}
          <a
            href="https://docs.opendota.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            OpenDota API
          </a>
          , an open-source service that parses Dota 2 replays. DotaPulse is not
          affiliated with or endorsed by Valve Corporation.
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground"
      >
        <span>Made with</span>
        <Heart className="h-4 w-4 fill-destructive text-destructive" />
        <span>by {DEVELOPER.name}</span>
      </motion.div>
    </div>
  );
}
