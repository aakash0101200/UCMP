/* ──────────────────────────────────────────────────────────
   src/pages/ContactPage.jsx
   UCMP “Contact Us” page – responsive, theme-aware, accessible
─────────────────────────────────────────────────────────── */
import React, { useState } from 'react';
import { MapPin, Mail, Phone, Globe, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // Simple front-end validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email address';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // TODO: integrate API call here
    toast.success('Message sent successfully!');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="space-y-16 px-4 py-12 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have questions or need assistance? Reach out to us and we’ll get back
          to you as soon as possible.
        </p>
      </section>

      {/* Content Grid */}
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card p-6 rounded-lg shadow"
        >
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 bg-input focus:outline-none focus:ring ${
                errors.name ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 bg-input focus:outline-none focus:ring ${
                errors.email ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 bg-input focus:outline-none focus:ring ${
                errors.subject ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-destructive">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 bg-input focus:outline-none focus:ring ${
                errors.message ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-destructive">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition"
          >
            Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Campus Address</h3>
              <p className="text-muted-foreground">
              Jaipur Engineering College & Research Centre (JECRC)<br />
              Shri Ram ki Nangal, via Sitapura RIICO, Opp. EPIP Gate, Tonk Road<br />
              Jaipur – 302022, Rajasthan, India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-muted-foreground">
                <a href="mailto:info@jecrcmail.com" className="hover:underline">
                info@jecrcmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-muted-foreground">
                <a href="tel: +911412770120" className="hover:underline">
                +91-141-2770120
                </a>
                <br />
                <a href="tel: +911412770232" className="hover:underline">
                +91-141-2770232
                </a>
                 <br />
                {/* +91-141-2770294 <br />
                +91-9982682917  <br />
                +91-9982682331  <br />
                +91-9251039858  <br />
                +91-9214699647  <br /> */}
               

              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Website:</h3>
              <p className="text-muted-foreground">
                <a href="https://jecrcfoundation.com/" target="_blank" className="hover:underline">
                jecrcfoundation.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold"> Visiting Hours:</h3>
              <p className="text-muted-foreground">
                8:30 a.m. to 3:30 p.m. <br />(Monday-Saturday)
              </p>
            </div>
          </div>
          




        </div>
      </div>
    </div>
  );
}
