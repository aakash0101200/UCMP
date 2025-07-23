/* ──────────────────────────────────────────────────────────
   src/pages/About.jsx
   UCMP “About” page – responsive, theme-aware, accessible
─────────────────────────────────────────────────────────── */
import React from 'react';
import { GraduationCap, UsersRound, Globe2 } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero / Intro */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            About UCMP
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto">
            The University College of Modern Pedagogy empowers the next generation
            of thinkers, creators, and leaders through world-class teaching,
            boundary-pushing research, and a commitment to community impact.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="leading-relaxed text-muted-foreground">
              To cultivate an inclusive academic environment where curiosity is
              celebrated, innovation is encouraged, and every learner gains the
              skills to shape a rapidly changing world.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="leading-relaxed text-muted-foreground">
              By 2030, UCMP aims to be among the top 50 globally recognized
              institutions for interdisciplinary research, sustainable
              campus initiatives, and student success outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="bg-card text-card-foreground py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold text-center mb-10">
            UCMP at a Glance
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: GraduationCap,
                label: 'Degree Programs',
                value: '120+',
              },
              {
                Icon: UsersRound,
                label: 'Students',
                value: '15,000+',
              },
              {
                Icon: Globe2,
                label: 'Partner Universities',
                value: '60+ countries',
              },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-lg bg-muted/40 p-8 text-center shadow-sm"
              >
                <Icon className="h-10 w-10 text-primary mb-4" />
                <span className="text-3xl font-bold">{value}</span>
                <span className="mt-2 text-sm text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">
          Leadership Team
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: 'Dr. Prof. Victor Gambhir',
              role: 'Vice-Chancellor',
              img: 'https://api.dicebear.com/7.x/initials/svg?seed=VG',
            },
            {
              name: 'Dr. Vinay Kumar Chandna',
              role: 'Principal',
              img: 'https://api.dicebear.com/7.x/initials/svg?seed=VC',
            },
            {
              name: 'O.P. Agarwal',
              role: 'Chairperson',
              img: 'https://api.dicebear.com/7.x/initials/svg?seed=O',
            },
          ].map(({ name, role, img }) => (
            <article
              key={name}
              className="flex flex-col items-center text-center space-y-4"
            >
              <img
                src={img}
                alt={name}
                className="h-28 w-28 rounded-full object-cover border-4 border-primary"
              />
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-light text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Join the UCMP Community</h2>
          <p className="leading-relaxed">
            Whether you are a prospective student, researcher, or partner
            institution, we invite you to be part of our journey toward a
            brighter, more innovative future.
          </p>
          <a
            href="/contact"
            className="inline-block bg-background text-foreground px-6 py-3 rounded-md font-medium hover:bg-background/80 transition-colors"
          >
            Contact Admissions
          </a>
        </div>
      </section>
    </div>
  );
}
