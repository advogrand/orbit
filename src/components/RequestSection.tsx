import { Mail, Phone, Send } from 'lucide-react';
import ContactForm from './ContactForm';
import { contactLinks, contacts } from '../lib/contacts';

type RequestSectionProps = {
  id: string;
};

const facts = ['Минимум три ночи', 'До восьми гостей', 'Трансфер по запросу'];

export default function RequestSection({ id }: RequestSectionProps) {
  return (
    <section
      id={id}
      className="request-section relative min-h-screen w-full overflow-hidden bg-[#05080D] text-white"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-8 px-6 py-24 md:px-10 md:py-32 lg:gap-16">
        <div className="col-span-12 min-w-0 lg:col-span-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#D89A52]">
            Частное проживание
          </p>
          <h2 className="mt-5 max-w-xl text-4xl font-light leading-[1.02] tracking-[-0.04em] md:text-6xl">
            Запросите даты
            <span className="block font-display italic">
              для частного проживания
            </span>
          </h2>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
            Оставьте контакты и предполагаемые даты. Консьерж ORBIT House
            проверит доступность и свяжется с вами в течение рабочего дня.
          </p>

          <div className="mt-10 grid gap-3 text-sm text-white/68">
            {facts.map((fact) => (
              <div
                key={fact}
                className="flex min-h-11 items-center border-b border-white/10 py-2"
              >
                {fact}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 text-sm text-white/68">
            <a
              className="flex min-h-11 items-center gap-3 outline-none transition-colors hover:text-[#D89A52] focus-visible:text-[#D89A52]"
              href={contactLinks.email}
            >
              <Mail size={17} />
              {contacts.email}
            </a>
            <a
              className="flex min-h-11 items-center gap-3 outline-none transition-colors hover:text-[#D89A52] focus-visible:text-[#D89A52]"
              href={contactLinks.phone}
            >
              <Phone size={17} />
              {contacts.phone}
            </a>
            <a
              className="flex min-h-11 items-center gap-3 outline-none transition-colors hover:text-[#D89A52] focus-visible:text-[#D89A52]"
              href={contactLinks.telegram}
              target="_blank"
              rel="noreferrer"
            >
              <Send size={17} />
              {contacts.telegram}
            </a>
          </div>
        </div>

        <div className="col-span-12 min-w-0 overflow-hidden lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
