'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'partnership', label: 'Partnership / Business' },
  { value: 'other', label: 'Other' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function validate(data: FormData = formData): FormErrors {
    const errs: FormErrors = {};

    if (!data.name.trim()) {
      errs.name = 'Name is required';
    }

    if (!data.email.trim()) {
      errs.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!data.subject) {
      errs.subject = 'Please select a subject';
    }

    if (!data.message.trim()) {
      errs.message = 'Message is required';
    } else if (data.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    } else if (data.message.trim().length > 5000) {
      errs.message = 'Message must be under 5,000 characters';
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    // Sync from DOM to catch browser autofill that skips onChange
    const fd = new FormData(e.currentTarget);
    const synced = {
      ...formData,
      name: (fd.get('name') as string) || formData.name,
      email: (fd.get('email') as string) || formData.email,
      message: (fd.get('message') as string) || formData.message,
      honeypot: (fd.get('website') as string) || formData.honeypot,
    };
    setFormData(synced);

    const validationErrors = validate(synced);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: synced.name.trim(),
          email: synced.email.trim(),
          subject: synced.subject,
          message: synced.message.trim(),
          honeypot: synced.honeypot,
        }),
      });

      if (res.status === 429) {
        setServerError('Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error === 'invalid_email'
          ? 'Please enter a valid email address.'
          : data.error === 'invalid_message'
            ? 'Message must be between 10 and 5,000 characters.'
            : 'Something went wrong. Please try again later.');
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError('Unable to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    setErrors({});
    setServerError('');
    setIsSuccess(false);
  }

  if (isSuccess) {
    return (
      <Card className="p-8 glass text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Message Sent!</h2>
        <p className="text-muted-foreground mb-6">
          We&apos;ll get back to you as soon as we can.
        </p>
        <Button variant="outline" onClick={handleReset}>
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 glass">
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="text-red-500 bg-red-500/10 rounded-lg p-3 text-sm">
            {serverError}
          </div>
        )}

        {/* Honeypot - hidden from real users */}
        <input
          type="text"
          name="website"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          aria-hidden="true"
        />

        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className="mt-1 bg-secondary/50"
            maxLength={100}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className="mt-1 bg-secondary/50"
            maxLength={254}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contact-subject">Subject</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => {
              setFormData({ ...formData, subject: value });
              if (errors.subject) setErrors({ ...errors, subject: undefined });
            }}
          >
            <SelectTrigger id="contact-subject" className="mt-1 bg-secondary/50">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="contact-message">Message</Label>
            <span className="text-xs text-muted-foreground">
              {formData.message.length}/5,000
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            placeholder="How can we help?"
            value={formData.message}
            onChange={(e) => {
              setFormData({ ...formData, message: e.target.value });
              if (errors.message) setErrors({ ...errors, message: undefined });
            }}
            rows={5}
            maxLength={5000}
            className="mt-1 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-y min-h-[120px]"
          />
          {errors.message && (
            <p className="text-sm text-red-500 mt-1">{errors.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
