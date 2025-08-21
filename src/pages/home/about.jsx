/* ──────────────────────────────────────────────────────────
   src/pages/About.jsx
   UCMP “About” page – responsive, theme-aware, accessible
─────────────────────────────────────────────────────────── */
import React from 'react';
import { GraduationCap, UsersRound, Globe2, } from 'lucide-react';
import  c from '../../assets/about/JecrcChairman.jpg';
import  vc from '../../assets/about/Victorgambhir.jpeg';
import  p from '../../assets/about/Chandna.jpg';

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero / Intro */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-6xl px-4 py-20 mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            About UCMP
          </h1>
          <p className="max-w-3xl mx-auto mt-6 text-lg sm:text-xl">
            The University College of Modern Pedagogy empowers the next generation
            of thinkers, creators, and leaders through world-class teaching,
            boundary-pushing research, and a commitment to community impact.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="max-w-6xl px-4 mx-auto">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
            <p className="leading-relaxed text-muted-foreground">
              To cultivate an inclusive academic environment where curiosity is
              celebrated, innovation is encouraged, and every learner gains the
              skills to shape a rapidly changing world.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Vision</h2>
            <p className="leading-relaxed text-muted-foreground">
              By 2030, UCMP aims to be among the top 50 globally recognized
              institutions for interdisciplinary research, sustainable
              campus initiatives, and student success outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-16 bg-card text-card-foreground">
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-10 text-2xl font-semibold text-center">
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
                className="flex flex-col items-center p-8 text-center rounded-lg shadow-sm bg-muted/40"
              >
                <Icon className="w-10 h-10 mb-4 text-primary" />
                <span className="text-3xl font-bold">{value}</span>
                <span className="mt-2 text-sm tracking-wide uppercase text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="max-w-6xl px-4 mx-auto">
        <h2 className="mb-8 text-2xl font-semibold text-center">
          Leadership Team
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: 'Dr. Prof. Victor Gambhir',
              role: 'Vice-Chancellor',
              img: vc,
            },
            {
              name: 'Dr. Vinay Kumar Chandna',
              role: 'Principal',
              img: p,
            },
            {
              name: 'O.P. Agarwal',
              role: 'Chairperson',
              img: c,
            },
          ].map(({ name, role, img }) => (
            <article
              key={name}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <img
                src={img}
                alt={name}
                className="object-cover border-4 rounded-full h-28 w-28 border-primary"
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
      <section className=" py-16 bg-light text-primary-foreground">
        <div className="max-w-4xl py-4 mx-auto space-y-6 text-center  rounded-md bg-muted/40 text-card-foreground shadow-sm">
          <h2 className="px-2 py-2 text-3xl font-bold text-black dark:text-white ">Join the UCMP Community</h2>
          <p className="leading-relaxed">
            Whether you are a prospective student, researcher, or partner
            institution, we invite you to be part of our journey toward a
            brighter, more innovative future.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 font-medium transition-colors border border-black rounded-md pb- bg-gradient-to-r from-primary to-primary/80 text-primary-foreground  hover:bg-background/80"
          >
            Contact Admissions
          </a>
        </div>
      </section>
    </div>
  );
}
