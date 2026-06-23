import { FormEvent, useState } from 'react';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  comment: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormValues | 'submit', string>>;

const initialValues: FormValues = {
  name: '',
  phone: '',
  email: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
  comment: '',
  consent: false,
};

const inputClass =
  'min-h-[52px] min-w-0 w-full max-w-full rounded-[14px] border border-white/15 bg-white/[0.035] px-4 text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D89A52] focus:ring-1 focus:ring-[#D89A52]/40';

const labelClass = 'mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/45';

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }

  if (!values.phone.trim() && !values.email.trim()) {
    errors.phone = 'Укажите телефон или электронную почту';
  }

  if (values.email.trim() && !emailPattern.test(values.email.trim())) {
    errors.email = 'Введите корректный адрес электронной почты';
  }

  if (!values.checkIn) {
    errors.checkIn = 'Укажите дату заезда';
  }

  if (!values.checkOut) {
    errors.checkOut = 'Укажите дату выезда';
  }

  if (
    values.checkIn &&
    values.checkOut &&
    new Date(values.checkOut) <= new Date(values.checkIn)
  ) {
    errors.checkOut = 'Дата выезда должна быть позже даты заезда';
  }

  if (!values.consent) {
    errors.consent = 'Подтвердите согласие на обработку данных';
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const updateValue = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === 'loading') {
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus('loading');

    try {
      const endpoint = import.meta.env.VITE_LEAD_ENDPOINT;

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Lead endpoint rejected request');
        }
      } else {
        // Подключение backend: задайте VITE_LEAD_ENDPOINT, и форма начнёт отправлять POST JSON.
        await new Promise((resolve) => window.setTimeout(resolve, 850));
      }

      setStatus('success');
    } catch {
      setStatus('idle');
      setErrors({
        submit:
          'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.',
      });
    }
  };

  if (status === 'success') {
    return (
      <div
        className="rounded-[14px] border border-white/15 bg-white/[0.035] p-8 text-white md:p-10"
        aria-live="polite"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#D89A52]">
          Заявка отправлена
        </p>
        <h3 className="mt-5 text-3xl font-light tracking-[-0.035em] md:text-4xl">
          Спасибо. Команда ORBIT House свяжется с вами, чтобы уточнить
          доступность и детали проживания.
        </h3>
        <button
          type="button"
          data-testid="reset-form"
          className="mt-8 min-h-12 rounded-full bg-[#D89A52] px-7 text-sm font-semibold text-black outline-none transition-colors hover:bg-[#C8873E] focus-visible:ring-2 focus-visible:ring-white"
          onClick={() => {
            setValues(initialValues);
            setErrors({});
            setStatus('idle');
          }}
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form grid w-full min-w-0 gap-5" onSubmit={submit} noValidate aria-live="polite">
      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <label className={labelClass} htmlFor="name">
            Имя
          </label>
          <input
            id="name"
            className={inputClass}
            value={values.name}
            placeholder="Ваше имя"
            aria-describedby={errors.name ? 'name-error' : undefined}
            onChange={(event) => updateValue('name', event.target.value)}
          />
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-[#D89A52]">
              {errors.name}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="phone">
            Телефон
          </label>
          <input
            id="phone"
            className={inputClass}
            value={values.phone}
            placeholder="+7"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            onChange={(event) => updateValue('phone', event.target.value)}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-2 text-sm text-[#D89A52]">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <label className={labelClass} htmlFor="email">
          Электронная почта
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={values.email}
          placeholder="name@example.com"
          aria-describedby={errors.email ? 'email-error' : undefined}
          onChange={(event) => updateValue('email', event.target.value)}
        />
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-[#D89A52]">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <label className={labelClass} htmlFor="checkIn">
            Дата заезда
          </label>
          <input
            id="checkIn"
            type="date"
            className={inputClass}
            value={values.checkIn}
            aria-describedby={errors.checkIn ? 'checkIn-error' : undefined}
            onChange={(event) => updateValue('checkIn', event.target.value)}
          />
          {errors.checkIn && (
            <p id="checkIn-error" className="mt-2 text-sm text-[#D89A52]">
              {errors.checkIn}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="checkOut">
            Дата выезда
          </label>
          <input
            id="checkOut"
            type="date"
            className={inputClass}
            value={values.checkOut}
            aria-describedby={errors.checkOut ? 'checkOut-error' : undefined}
            onChange={(event) => updateValue('checkOut', event.target.value)}
          />
          {errors.checkOut && (
            <p id="checkOut-error" className="mt-2 text-sm text-[#D89A52]">
              {errors.checkOut}
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <label className={labelClass} htmlFor="guests">
          Количество гостей
        </label>
        <select
          id="guests"
          className={inputClass}
          value={values.guests}
          onChange={(event) => updateValue('guests', event.target.value)}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((guest) => (
            <option key={guest} value={guest}>
              {guest}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <label className={labelClass} htmlFor="comment">
          Комментарий
        </label>
        <textarea
          id="comment"
          className={`${inputClass} min-h-[140px] resize-y py-4`}
          value={values.comment}
          placeholder="Расскажите о датах, составе гостей или трансфере"
          onChange={(event) => updateValue('comment', event.target.value)}
        />
      </div>

      <div>
        <label className="contact-form__consent flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white/70">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-white/20 bg-white/[0.035] accent-[#D89A52]"
            checked={values.consent}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            onChange={(event) => updateValue('consent', event.target.checked)}
          />
          Я согласен на обработку персональных данных
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-2 text-sm text-[#D89A52]">
            {errors.consent}
          </p>
        )}
      </div>

      {errors.submit && (
        <p className="text-sm leading-relaxed text-[#D89A52]" role="status">
          {errors.submit}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          data-testid="submit-form"
          className="min-h-12 rounded-full bg-[#D89A52] px-8 text-sm font-semibold text-black outline-none transition-colors hover:bg-[#C8873E] focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Отправляем…' : 'Отправить заявку'}
        </button>
        <p className="contact-form__note text-sm text-white/45">
          Мы ответим в течение одного рабочего дня.
        </p>
      </div>
    </form>
  );
}
