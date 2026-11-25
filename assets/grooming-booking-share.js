/**
 * Sharing the grooming booking (CODE-09): copied text, messages to the salon (WhatsApp, email, SMS),
 * calendar event (.ics and Google Calendar) and map links.
 * File: assets/grooming-booking-share.js. GroomingBookingWizard (assets/grooming-booking.js) extends
 * this class, so the methods use the wizard state (bookingData, t(), money()...).
 */

(function () {
  'use strict';

  const ns = (window.GroomingBooking = window.GroomingBooking || {});
  const { SALON_TIME_ZONE } = ns;

  class BookingShare {
    copyBookingDetails() {
      if (!this.copyBtn) return;
      const summaryText = this.bookingMessage('copy');
      // Clipboard blocked: the details are shown on the page instead (no alert()).
      const showText = () => this.showSubmitStatus('is-error', `${this.t('copy_failed')}\n\n${summaryText}`);
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        showText();
        return;
      }
      navigator.clipboard
        .writeText(summaryText)
        .then(() => {
          const orig = this.copyBtn.textContent;
          this.copyBtn.textContent = this.t('copied');
          setTimeout(() => {
            this.copyBtn.textContent = orig;
          }, 2000);
        })
        .catch(showText);
    }

    /**
     * Booking details shared by the messages to the salon, the copied text and the calendar event,
     * as [label, value] pairs in the page language. Empty values are left out.
     */
    bookingDetails({ owner = true, address = false } = {}) {
      const d = this.bookingData;
      const breed = [d.petBreed || this.t('mixed_breed'), this.sizeLabel(d.dogSize)].filter(Boolean).join(' · ');
      const rows = [
        ['label_dog', `${d.petName || this.t('your_dog')} (${breed})`],
        ['label_age', d.petAge],
        ['label_service', d.serviceName],
        ['label_extras', (d.addons || []).map((a) => `${a.name} (+${this.money(a.price)})`).join(', ')],
        ['label_date', this.formatHumanDate(d.date)],
        ['label_time', `${d.slot} - ${this.calculateEndTime(d.slot)} h (${d.duration || this.t('one_hour')})`],
        ['label_groomer', this.groomerName()],
        ['label_price', d.price],
        ['label_special', (d.specialNeeds || []).join(', ')],
        ['label_notes', d.notes],
        ['label_owner', owner ? [d.customerName, d.customerPhone, d.customerEmail].filter(Boolean).join(' · ') : ''],
        ['label_address', address ? this.salonAddress : ''],
      ];
      return rows.filter(([, value]) => value).map(([key, value]) => [this.t(key), value]);
    }

    /** Text of the booking: 'whatsapp' (bold labels), 'email', 'sms' (one paragraph) or 'copy'. */
    bookingMessage(kind) {
      if (kind === 'sms') {
        const rows = this.bookingDetails();
        return [this.t('message_intro'), ...rows.map(([label, value]) => `${label}: ${value}.`)].join(' ');
      }
      if (kind === 'copy') {
        const rows = this.bookingDetails({ address: true });
        return [this.t('message_title'), ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n');
      }
      const rows = this.bookingDetails();
      const lines = rows.map(([label, value]) => (kind === 'whatsapp' ? `*${label}:* ${value}` : `• ${label}: ${value}`));
      return [this.t('message_intro'), '', ...lines, '', this.t('message_outro')].join('\n');
    }

    /**
     * Shared event data for Google Calendar and the .ics file, in the page language.
     * start/end are local salon times (YYYYMMDDTHHMMSS) to be read in SALON_TIME_ZONE.
     */
    calendarEventData() {
      const d = this.bookingData;
      const dateClean = d.date.replace(/-/g, '');
      const toStamp = (time) => {
        const [h, m] = time.split(':');
        return `${dateClean}T${h.padStart(2, '0')}${m.padStart(2, '0')}00`;
      };
      const endSlot = this.calculateEndTime(d.slot);
      const petName = d.petName || this.t('your_dog');
      const location = this.salonAddress || this.t('salon');
      const lines = this.bookingDetails({ owner: false, address: true }).map(([label, value]) => `${label}: ${value}`);
      return {
        petName,
        title: this.t('event_title', { service: d.serviceName, dog: petName }),
        details: lines.join('\n'),
        location,
        start: toStamp(d.slot),
        end: toStamp(endSlot),
      };
    }

    /**
     * iCalendar file (RFC 5545) for Apple Calendar, Outlook and Android, with the salon time zone
     * and two reminders (1 day and 2 hours before).
     */
    generateIcsContent() {
      if (!this.bookingData.date || !this.bookingData.slot) return null;
      const ev = this.calendarEventData();
      // Escape TEXT values: backslash, comma, semicolon and line breaks.
      const esc = (value) =>
        String(value)
          .replace(/\\/g, '\\\\')
          .replace(/;/g, '\\;')
          .replace(/,/g, '\\,')
          .replace(/\r?\n/g, '\\n');
      // Fold lines longer than 75 bytes (continuation lines start with a space).
      const encoder = new TextEncoder();
      const fold = (line) => {
        const out = [];
        let current = '';
        let bytes = 0;
        for (const ch of line) {
          const size = encoder.encode(ch).length;
          if (bytes + size > (out.length ? 74 : 75)) {
            out.push(current);
            current = '';
            bytes = 0;
          }
          current += ch;
          bytes += size;
        }
        out.push(current);
        return out.join('\r\n ');
      };

      const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const domain = window.location.hostname || 'shopify-store';
      const uid = (this.bookingData.savedReference || 'grooming-' + Date.now()) + '@' + domain;
      const reminder = this.t('event_reminder', { dog: ev.petName });

      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Shopify Grooming Booking//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        // Europe/Madrid rules (CET/CEST), so the event keeps its time in any device time zone.
        'BEGIN:VTIMEZONE',
        `TZID:${SALON_TIME_ZONE}`,
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:+0100',
        'TZOFFSETTO:+0200',
        'TZNAME:CEST',
        'DTSTART:19700329T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:+0200',
        'TZOFFSETTO:+0100',
        'TZNAME:CET',
        'DTSTART:19701025T030000',
        'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
        'END:STANDARD',
        'END:VTIMEZONE',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;TZID=${SALON_TIME_ZONE}:${ev.start}`,
        `DTEND;TZID=${SALON_TIME_ZONE}:${ev.end}`,
        `SUMMARY:${esc(ev.title)}`,
        `DESCRIPTION:${esc(ev.details)}`,
        `LOCATION:${esc(ev.location)}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT2H',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(reminder)}`,
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(reminder)}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ]
        .map(fold)
        .join('\r\n') + '\r\n';
    }

    /**
     * Paso 3 (Funcionalidad 2): Descarga reactiva del archivo .ics con feedback visual y compatibilidad móvil
     */
    downloadIcsFile() {
      const icsData = this.generateIcsContent();
      if (!icsData) return;

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const petNameClean = (this.bookingData.petName || 'mascota')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const filename = `cita-peluqueria-${petNameClean}.ics`;

      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', filename);
      tempLink.setAttribute('target', '_blank');
      document.body.appendChild(tempLink);
      tempLink.click();

      setTimeout(() => {
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(url);
      }, 500);

      // Feedback visual temporal en el botón
      if (this.appleCalendarBtn) {
        const origText = this.appleCalendarBtn.textContent;
        this.appleCalendarBtn.textContent = this.t('downloaded');
        this.appleCalendarBtn.classList.add('is-active');
        setTimeout(() => {
          this.appleCalendarBtn.textContent = origText;
          this.appleCalendarBtn.classList.remove('is-active');
        }, 2000);
      }
    }

    /**
     * Paso 1 (Funcionalidad 5): Generador de Enlace de Confirmación por Correo (mailto:)
     * Formatea asunto y cuerpo con desglose completo del servicio, extras y mascota.
     */
    buildEmailConfirmationLink() {
      const subject = this.t('message_subject', {
        dog: this.bookingData.petName || this.t('your_dog'),
        date: this.formatHumanDate(this.bookingData.date),
        time: this.bookingData.slot,
      });
      const body = this.bookingMessage('email');
      const targetEmail = this.salonEmail || '';

      let mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (this.bookingData.customerEmail && this.bookingData.customerEmail.includes('@')) {
        mailtoUrl += `&cc=${encodeURIComponent(this.bookingData.customerEmail)}`;
      }
      return mailtoUrl;
    }

    /**
     * Paso 1 (Funcionalidad 5): Generador de Enlace de Confirmación por SMS (sms:)
     * Compatible con iOS (&body=) y Android (?body=)
     */
    buildSmsConfirmationLink() {
      let cleanPhone = (this.whatsappNumber || '').replace(/\D/g, '');
      if (cleanPhone.length === 9 && (cleanPhone.startsWith('6') || cleanPhone.startsWith('7'))) {
        cleanPhone = '+34' + cleanPhone;
      } else if (!cleanPhone.startsWith('+') && cleanPhone.length > 9) {
        cleanPhone = '+' + cleanPhone;
      }

      const smsText = this.bookingMessage('sms');

      // Detección de dispositivo iOS vs Android / Otros
      const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) && !window.MSStream;
      const separator = isIos ? '&body=' : '?body=';

      return `sms:${cleanPhone}${separator}${encodeURIComponent(smsText)}`;
    }

    /**
     * Paso 1 (Funcionalidad 4): Generador de URL de navegación para Google Maps
     * Compatible con escritorio (cálculo de ruta en navegador) y móviles (app nativa Google Maps)
     */
    buildGoogleMapsUrl() {
      const address = this.salonAddress;
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }

    /**
     * Paso 1 (Funcionalidad 4): Generador de URL de navegación para Apple Maps
     * Optimizado para macOS y dispositivos iOS
     */
    buildAppleMapsUrl() {
      const address = this.salonAddress;
      return `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
    }

    /**
     * Paso 1 (Funcionalidad 4): Selector inteligente de proveedor de mapas según dispositivo o preferencia
     * @param {'auto'|'google'|'apple'} preference
     */
    buildMapsNavigationUrl(preference = 'auto') {
      if (preference === 'apple') return this.buildAppleMapsUrl();
      if (preference === 'google') return this.buildGoogleMapsUrl();

      // Detección de ecosistema Apple (iOS / macOS)
      const isApple = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) && !window.MSStream;
      if (isApple) {
        return this.buildAppleMapsUrl();
      }
      return this.buildGoogleMapsUrl();
    }
  }

  ns.BookingShare = BookingShare;
})();
