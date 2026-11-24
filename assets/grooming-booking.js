/**
 * Native Dog Grooming Appointment Booking Controller
 * File: assets/grooming-booking.js
 * Architecture: Clean Vanilla JS, 30-Day Mini-Calendar, Dynamic Pricing & WhatsApp Direct Booking
 */

(function () {
  'use strict';

  // Same time zone the booking app uses for the salon schedule.
  const SALON_TIME_ZONE = 'Europe/Madrid';

  /**
   * Catálogo Inteligente de Razas Caninas y Mestizos
   * Los perros mestizos/cruces tienen size: null porque su peso no puede inferirse automáticamente.
   */
  const DOG_BREEDS_CATALOG = [
    // Mestizos, Cruces y Sin raza (Requieren selección manual de tamaño)
    {
      name: 'Mestizo / Sin raza',
      size: null,
      isMixed: true,
      keywords: ['mestizo', 'mestiza', 'sin raza', 'chucho', 'cruce', 'mix', 'cruzado', 'cruzada', 'mil leches', 'comun', 'callejero', 'callejera']
    },
    {
      name: 'Cruce / Mezcla',
      size: null,
      isMixed: true,
      keywords: ['cruce', 'mezcla', 'cruza', 'cruzado', 'cruzada']
    },

    // Mini / Toy (<5 kg)
    { name: 'Chihuahua', size: 'mini', keywords: ['chihuahua', 'chiguagua'] },
    { name: 'Yorkshire Terrier', size: 'mini', keywords: ['yorkshire', 'yorki', 'yorkie', 'terrier yorkshire'] },
    { name: 'Bichón Maltés', size: 'mini', keywords: ['bichon maltes', 'maltes', 'bichon'] },
    { name: 'Caniche Toy / Enano', size: 'mini', keywords: ['caniche toy', 'poodle toy', 'caniche enano', 'toy poodle'] },
    { name: 'Pomerania (Lulú)', size: 'mini', keywords: ['pomerania', 'pomeranian', 'lulu de pomerania', 'spitz enano'] },
    { name: 'Teckel Miniatura (Dachshund)', size: 'mini', keywords: ['teckel', 'dachshund', 'teckel mini', 'perro salchicha'] },
    { name: 'Pinscher Miniatura', size: 'mini', keywords: ['pinscher', 'miniature pinscher', 'pincher'] },
    { name: 'Shih Tzu', size: 'mini', keywords: ['shih tzu', 'shi tzu', 'shitzu'] },
    { name: 'Bichón Frisé', size: 'mini', keywords: ['bichon frise', 'frise'] },
    { name: 'Papillón', size: 'mini', keywords: ['papillon', 'mariposa'] },
    { name: 'Pekinés', size: 'mini', keywords: ['pekines', 'pequines'] },
    { name: 'Bichón Habanero', size: 'mini', keywords: ['bichon habanero', 'habanero'] },

    // Mediano (5 - 15 kg)
    { name: 'Beagle', size: 'medium', keywords: ['beagle'] },
    { name: 'Bulldog Francés', size: 'medium', keywords: ['bulldog frances', 'frenchie', 'french bulldog'] },
    { name: 'Cocker Spaniel', size: 'medium', keywords: ['cocker', 'cocker spaniel', 'spaniel'] },
    { name: 'Border Collie', size: 'medium', keywords: ['border collie', 'collie'] },
    { name: 'Schnauzer Miniatura / Mediano', size: 'medium', keywords: ['schnauzer', 'schnauzer mini', 'schnauzer mediano'] },
    { name: 'Bodeguero Andaluz', size: 'medium', keywords: ['bodeguero', 'bodeguero andaluz', 'ratonero bodeguero'] },
    { name: 'Carlino (Pug)', size: 'medium', keywords: ['pug', 'carlino'] },
    { name: 'Jack Russell Terrier', size: 'medium', keywords: ['jack russell', 'russell terrier', 'jack russel'] },
    { name: 'West Highland White Terrier (Westie)', size: 'medium', keywords: ['westie', 'west highland'] },
    { name: 'Bulldog Inglés', size: 'medium', keywords: ['bulldog ingles', 'english bulldog'] },
    { name: 'Bull Terrier', size: 'medium', keywords: ['bull terrier'] },
    { name: 'Caniche Mediano', size: 'medium', keywords: ['caniche mediano', 'caniche', 'poodle'] },
    { name: 'Basset Hound', size: 'medium', keywords: ['basset hound', 'basset'] },
    { name: 'Shiba Inu', size: 'medium', keywords: ['shiba', 'shiba inu'] },
    { name: 'Corgi (Pembroke / Cardigan)', size: 'medium', keywords: ['corgi', 'welsh corgi'] },
    { name: 'Perro de Agua Español', size: 'medium', keywords: ['perro de agua', 'turco andaluz', 'spanish water dog'] },
    { name: 'Podenco (Pequeño / Mediano)', size: 'medium', keywords: ['podenco', 'podenco andaluz', 'podenco ibicenco', 'podenco canario'] },
    { name: 'Whippet', size: 'medium', keywords: ['whippet'] },
    { name: 'Boston Terrier', size: 'medium', keywords: ['boston terrier'] },
    { name: 'Staffordshire Bull Terrier', size: 'medium', keywords: ['staffy', 'staffordshire bull terrier', 'stafford'] },

    // Grande (>15 kg)
    { name: 'Labrador Retriever', size: 'large', keywords: ['labrador', 'labrador retriever'] },
    { name: 'Golden Retriever', size: 'large', keywords: ['golden', 'golden retriever'] },
    { name: 'Pastor Alemán', size: 'large', keywords: ['pastor aleman', 'ovejero aleman', 'german shepherd'] },
    { name: 'Pastor Belga (Malinois)', size: 'large', keywords: ['pastor belga', 'malinois', 'groenendael'] },
    { name: 'Pastor Australiano (Aussie)', size: 'large', keywords: ['pastor australiano', 'aussie', 'australian shepherd'] },
    { name: 'Boxer', size: 'large', keywords: ['boxer'] },
    { name: 'Husky Siberiano', size: 'large', keywords: ['husky', 'husky siberiano', 'siberian husky'] },
    { name: 'Dóberman', size: 'large', keywords: ['doberman', 'dobermann'] },
    { name: 'Rottweiler', size: 'large', keywords: ['rottweiler', 'rotweiler'] },
    { name: 'Boyero de Berna', size: 'large', keywords: ['boyero de berna', 'bernese mountain dog', 'bernes'] },
    { name: 'Galgo Español / Lebrel', size: 'large', keywords: ['galgo', 'galgo espanol', 'greyhound'] },
    { name: 'Mastín Español / Pirineo', size: 'large', keywords: ['mastin', 'mastin espanol', 'mastin del pirineo'] },
    { name: 'Gran Danés (Dogo Alemán)', size: 'large', keywords: ['gran danes', 'dogo aleman', 'great dane'] },
    { name: 'San Bernardo', size: 'large', keywords: ['san bernardo', 'saint bernard'] },
    { name: 'Terranova', size: 'large', keywords: ['terranova', 'newfoundland'] },
    { name: 'Samoyedo', size: 'large', keywords: ['samoyedo', 'samoyed'] },
    { name: 'Weimaraner (Braco de Weimar)', size: 'large', keywords: ['weimaraner', 'braco de weimar', 'braco'] },
    { name: 'Dálmata', size: 'large', keywords: ['dalmata', 'dalmatian'] },
    { name: 'Akita Inu', size: 'large', keywords: ['akita', 'akita inu', 'akita americano'] },
    { name: 'Cane Corso', size: 'large', keywords: ['cane corso', 'mastin italiano'] },
    { name: 'Setter Irlandés / Inglés', size: 'large', keywords: ['setter', 'setter irlandes', 'setter ingles'] }
  ];

  class GroomingBookingWizard {
    constructor(section) {
      this.section = section;
      this.sectionId = section.dataset.sectionId;
      this.currentStep = 1;
      this.whatsappNumber = section.dataset.whatsappNumber || '';
      this.salonAddress = section.dataset.salonAddress || '';
      this.salonEmail = section.dataset.salonEmail || '';
      // Texts and formats of the page language (CODE-11).
      this.locale = document.documentElement.lang || 'es';
      this.moneyFormat = section.dataset.moneyFormat || '';
      this.i18n = this.readTexts();
      // Busy time ranges per day from the booking app ({ 'YYYY-MM-DD': [[startMin, endMin]] }).
      this.busy = {};
      this._lastSyncedSignature = null;

      // Elements
      this.stepIndicators = section.querySelectorAll('[data-step-indicator]');
      this.stepPanels = section.querySelectorAll('[data-step-panel]');
      this.priceEstimateEl = section.querySelector('[data-booking-estimate-price]');
      this.durationEstimateEl = section.querySelector('[data-booking-estimate-duration]');
      this.whatsappCta = section.querySelector('[data-booking-action="whatsapp-confirm"]');
      this.appleCalendarBtn = section.querySelector('[data-booking-action="apple-calendar"]');
      this.gcalLink = section.querySelector('[data-booking-action="gcal-link"]');
      this.emailConfirmBtn = section.querySelector('[data-booking-action="email-confirm"]');
      this.smsConfirmBtn = section.querySelector('[data-booking-action="sms-confirm"]');
      this.mapsBtn = section.querySelector('[data-booking-action="salon-maps"]');
      this.copyBtn = section.querySelector('[data-booking-action="copy-details"]');
      this.successBanner = section.querySelector('[data-booking-success-banner]');
      this.submitBtn = section.querySelector('[data-booking-action="submit-booking"]');
      this.submitStatus = section.querySelector('[data-booking-submit-status]');
      this.afterSubmit = section.querySelector('[data-booking-after-submit]');
      this.submitting = false;

      // Breed search elements (Paso 1)
      this.quickBreedInput = section.querySelector('[data-booking-input="quickBreed"]');
      this.quickBreedClearBtn = section.querySelector('[data-breed-action="clear"]');
      this.breedFeedbackEl = section.querySelector('[data-breed-feedback]');
      this.breedFeedbackText = section.querySelector('[data-breed-feedback-text]');

      // Mini-Calendar Elements
      this.calMonthLabel = section.querySelector('[data-cal-month-label]');
      this.calDaysGrid = section.querySelector('[data-cal-days-grid]');
      this.calSelectedDisplay = section.querySelector('[data-cal-selected-display]');
      this.calNavPrev = section.querySelector('[data-cal-nav="prev"]');
      this.calNavNext = section.querySelector('[data-cal-nav="next"]');

      // Shift & Slot Elements (Dynamic Saturday & Weekday hours)
      this.shiftPickerWrap = section.querySelector('.booking-shift-picker-wrap');
      this.morningSlotsGrid = section.querySelector('[data-slots-grid="morning"]');
      this.afternoonSlotsGrid = section.querySelector('[data-slots-grid="afternoon"]');
      this.afternoonGroup = section.querySelector('[data-shift-group="afternoon"]');
      this.saturdayNotice = section.querySelector('[data-shift-saturday-notice]');
      this.fullyBookedNotice = section.querySelector('[data-shift-fully-booked-notice]');

      // Dynamic Config (Shopify Metaobjects or Defaults)
      this.config = {
        slotDurationMins: 60,
        daysOpen: [1, 2, 3, 4, 5, 6],
        closedDates: [],
        morningSlots: ['10:00', '11:00', '12:00'],
        afternoonSlots: ['17:00', '18:00', '19:00'],
        saturdayMorningSlots: ['10:00', '11:00', '12:00'],
        saturdayAfternoonSlots: [],
        services: [],
        addons: [],
      };

      const configScript = section.querySelector('[data-grooming-config]');
      if (configScript) {
        try {
          const parsed = JSON.parse(configScript.textContent);
          this.config = Object.assign(this.config, parsed);
        } catch (e) {
          console.warn('Unable to parse grooming config JSON', e);
        }
      }

      // Calendar Dates & Boundaries (Next 30 Days)
      this.today = new Date();
      this.today.setHours(0, 0, 0, 0);

      this.maxDate = new Date(this.today);
      this.maxDate.setDate(this.today.getDate() + 30);
      this.maxDate.setHours(23, 59, 59, 999);

      this.currentCalDate = new Date(this.today);

      // Default selected date: First available open date from tomorrow
      const defDate = new Date(this.today);
      defDate.setDate(this.today.getDate() + 1);
      for (let i = 0; i < 14; i++) {
        const k = this.formatDateKey(defDate);
        const isOpenDow = this.isDayOpen(defDate);
        const isNotClosed = !Array.isArray(this.config.closedDates) || !this.config.closedDates.includes(k);
        if (isOpenDow && isNotClosed) {
          break;
        }
        defDate.setDate(defDate.getDate() + 1);
      }

      // Initial active service & slot from checked radios or defaults
      const checkedService = section.querySelector('input[name="grooming_service"]:checked');
      const initialServiceId = checkedService ? checkedService.value : '';
      const checkedSlot = section.querySelector('input[name="grooming_slot"]:checked');
      const initialSlot = checkedSlot ? checkedSlot.value : '10:00';

      // State
      this.bookingData = {
        savedReference: null,
        serviceId: initialServiceId,
        serviceName: '',
        dogSize: 'mini',
        addons: [],
        price: '',
        duration: '1 hora',
        date: this.formatDateKey(defDate),
        slot: initialSlot,
        petName: '',
        petBreed: '',
        petAge: '',
        specialNeeds: [],
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        notes: '',
      };

      this.init();
    }

    init() {
      this.initEvents();
      this.applyUrlPrefill();
      this.updatePriceEstimate();
      this.updateAvailableSlots();
      this.renderMiniCalendar();
      this.loadBusySlots();
      this.loadMyDogs();
    }

    /** Shows the waiting list form under the "fully booked" notice, filled with known contact data. */
    toggleWaitlist(show) {
      const box = this.section.querySelector('[data-booking-waitlist]');
      if (!box) return;
      box.hidden = !show;
      if (!show) return;
      const status = box.querySelector('[data-waitlist-status]');
      if (box.dataset.date !== this.bookingData.date) {
        box.dataset.date = this.bookingData.date;
        if (status) status.hidden = true;
        const form = box.querySelector('[data-waitlist-form]');
        if (form) form.hidden = false;
      }
      const copy = (from, to) => {
        const source = this.section.querySelector(`[data-booking-input="${from}"]`);
        const target = box.querySelector(`[data-waitlist="${to}"]`);
        if (source && target && source.value && !target.value) target.value = source.value;
      };
      copy('customerName', 'name');
      copy('customerEmail', 'email');
      copy('customerPhone', 'phone');
      if (!box.dataset.bound) {
        box.dataset.bound = '1';
        box.querySelector('[data-waitlist-submit]')?.addEventListener('click', () => this.submitWaitlist(box));
      }
    }

    submitWaitlist(box) {
      const value = (key) => (box.querySelector(`[data-waitlist="${key}"]`)?.value || '').trim();
      const status = box.querySelector('[data-waitlist-status]');
      const button = box.querySelector('[data-waitlist-submit]');
      const say = (text, ok) => {
        if (!status) return;
        status.textContent = text;
        status.hidden = false;
        status.classList.toggle('is-success', Boolean(ok));
      };
      if (!value('name') || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('email'))) {
        say(this.t('waitlist_invalid'), false);
        return;
      }
      const petInput = this.section.querySelector('[data-booking-input="petName"]');
      button.disabled = true;
      fetch('/apps/reservas/lista-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          date: this.bookingData.date,
          shift: value('shift') || 'any',
          name: value('name'),
          email: value('email'),
          phone: value('phone'),
          service: this.bookingData.serviceName,
          serviceId: this.bookingData.serviceId,
          dogSize: this.bookingData.dogSize,
          petName: petInput ? petInput.value.trim() : '',
          website: value('website'),
          locale: document.documentElement.lang || 'es',
        }),
      })
        .then((response) => response.json().catch(() => ({ ok: false })))
        .then((result) => {
          button.disabled = false;
          if (result && result.ok) {
            const form = box.querySelector('[data-waitlist-form]');
            if (form) form.hidden = true;
            say(
              this.t(result.already ? 'waitlist_already' : 'waitlist_joined'),
              true
            );
          } else if (result && result.error === 'too_many') {
            say(this.t('waitlist_too_many'), false);
          } else {
            say(this.t('waitlist_failed'), false);
          }
        })
        .catch(() => {
          button.disabled = false;
          say(this.t('no_connection'), false);
        });
    }

    /**
     * Booking links from the "time for the next visit" email: ?servicio=<handle>&tamano=<size>
     * &perro=<name>&raza=<breed>&peluquera=<id>. Unknown values are ignored.
     */
    applyUrlPrefill() {
      let params;
      try {
        params = new URLSearchParams(window.location.search);
      } catch (error) {
        return;
      }
      const pick = (name, value) => {
        if (!value) return;
        const radio = [...this.section.querySelectorAll(`input[name="${name}"]`)].find((input) => input.value === value);
        if (radio && !radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      pick('grooming_service', params.get('servicio'));
      pick('dog_size', params.get('tamano'));
      const fill = (key, value) => {
        const input = this.section.querySelector(`[data-booking-input="${key}"]`);
        if (input && value && !input.value) input.value = value.slice(0, 80);
      };
      fill('petName', params.get('perro'));
      fill('petBreed', params.get('raza'));
      // Waiting list email: the freed date and time.
      const date = params.get('fecha');
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [y, m, d] = date.split('-').map(Number);
        const day = new Date(y, m - 1, d);
        if (day >= this.today && day <= this.maxDate) {
          this.bookingData.date = date;
          this.currentCalDate = new Date(y, m - 1, 1);
          const time = params.get('hora');
          if (time && /^\d{2}:\d{2}$/.test(time)) this.bookingData.slot = time;
        }
      }
      const groomer = params.get('peluquera');
      if (groomer && /^\d+$/.test(groomer)) {
        // The groomer list arrives with the availability: renderGroomers applies it.
        this.bookingData.groomer = groomer;
        this.groomerNoteKind = 'last';
      }
    }

    /**
     * Logged-in customers: fills in their contact details and offers their dogs (from the booking
     * app, /apps/reservas/mis-perros). Logged-out visitors or an app that does not answer: nothing changes.
     */
    loadMyDogs() {
      return fetch('/apps/reservas/mis-perros', { headers: { Accept: 'application/json' } })
        .then((response) => (response.ok ? response.json() : null))
        .then((result) => {
          if (!result || !result.ok || !result.loggedIn) return;
          this.prefillContact(result.customer);
          this.renderMyDogs(result.dogs || []);
        })
        .catch(() => {});
    }

    /** Payment line of the summary (step 4), following the deposit setting of the booking app. */
    renderPaymentNote(deposit) {
      const el = this.section.querySelector('[data-booking-payment-note]');
      if (!el || !deposit || deposit.mode === 'off') return;
      const amount = deposit.type === 'percent' ? `${deposit.percent} %` : this.money(deposit.amount);
      el.textContent = this.t(deposit.mode === 'required' ? 'payment_required' : 'payment_optional', { amount });
    }

    /** Groomer picker (step 2), only when the salon has two or more active groomers. */
    renderGroomers(groomers) {
      const box = this.section.querySelector('[data-booking-groomers]');
      const list = this.section.querySelector('[data-booking-groomers-list]');
      this.groomers = groomers;
      if (!box || !list) return;
      if (groomers.length < 2) {
        box.hidden = true;
        this.bookingData.groomer = 'any';
        return;
      }
      if (this.groomersRendered) {
        this.markGroomer();
        return;
      }
      this.groomersRendered = true;
      const options = [{ id: 'any', name: this.t('groomer_any'), bio: this.t('groomer_any_bio') }, ...groomers];
      options.forEach((g) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'booking-my-dog';
        button.dataset.groomerId = g.id;
        button.setAttribute('role', 'radio');
        button.textContent = g.name;
        if (g.bio) {
          const small = document.createElement('small');
          small.textContent = g.bio;
          button.appendChild(small);
        }
        button.addEventListener('click', () => this.selectGroomer(g.id, ''));
        list.appendChild(button);
      });
      // A groomer proposed before the list arrived (favourite of the chosen dog) must still exist.
      if (!this.bookingData.groomer || !groomers.some((g) => g.id === this.bookingData.groomer)) {
        this.bookingData.groomer = 'any';
        this.groomerNoteKind = '';
      }
      this.markGroomer();
      box.hidden = false;
      if (this.bookingData.groomer !== 'any') this.loadBusySlots();
    }

    markGroomer() {
      const current = this.bookingData.groomer || 'any';
      this.section.querySelectorAll('[data-booking-groomers-list] [data-groomer-id]').forEach((b) => {
        const on = b.dataset.groomerId === current;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      const dog = this.selectedDog;
      const name = this.groomerName();
      // Why this groomer is proposed: the dog's favourite, or who groomed it last time.
      let note = '';
      if (dog && name && this.groomerNoteKind === 'favorite' && current === dog.favoriteGroomer) {
        note = this.t('groomer_favorite_note', { groomer: name, dog: dog.name });
      } else if (dog && name && this.groomerNoteKind === 'last' && current === dog.lastGroomer) {
        note = this.t('groomer_last_note', { groomer: name, dog: dog.name });
      }
      const hint = this.section.querySelector('[data-booking-groomers-hint]');
      if (hint) {
        hint.textContent = note;
        hint.hidden = !note;
      }
      // Logged-in client with a dog and a specific groomer that is not already the favourite.
      const favWrap = this.section.querySelector('[data-booking-fav-wrap]');
      if (favWrap) {
        const offer = !!(dog && name && current !== 'any' && current !== dog.favoriteGroomer);
        favWrap.hidden = !offer;
        if (!offer) favWrap.querySelector('[data-booking-fav]').checked = false;
        favWrap.querySelector('[data-booking-fav-text]').textContent = offer
          ? this.t('groomer_save_favorite', { groomer: name, dog: dog.name })
          : '';
      }
    }

    /** Changes the groomer and reloads her free times. */
    selectGroomer(id, noteKind = '') {
      const changed = (this.bookingData.groomer || 'any') !== id;
      this.bookingData.groomer = id;
      this.groomerNoteKind = noteKind;
      this.markGroomer();
      if (changed) this.loadBusySlots();
    }

    groomerName() {
      const g = (this.groomers || []).find((x) => x.id === this.bookingData.groomer);
      return g ? g.name : '';
    }

    prefillContact(customer) {
      if (!customer) return;
      const fill = (key, value) => {
        const input = this.section.querySelector(`[data-booking-input="${key}"]`);
        // Never overwrite what the visitor has already typed.
        if (input && value && !input.value.trim()) input.value = value;
      };
      fill('customerName', customer.name);
      fill('customerPhone', customer.phone);
      fill('customerEmail', customer.email);
    }

    renderMyDogs(dogs) {
      const box = this.section.querySelector('[data-booking-my-dogs]');
      const list = this.section.querySelector('[data-booking-my-dogs-list]');
      if (!box || !list || !dogs.length) return;
      const buttons = [];
      const addButton = (label, detail, onSelect) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'booking-my-dog';
        button.setAttribute('aria-pressed', 'false');
        button.textContent = label;
        if (detail) {
          const small = document.createElement('small');
          small.textContent = detail;
          button.appendChild(small);
        }
        button.addEventListener('click', () => {
          buttons.forEach((b) => {
            b.classList.toggle('is-selected', b === button);
            b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
          });
          onSelect();
        });
        buttons.push(button);
        list.appendChild(button);
      };

      dogs.forEach((dog) => {
        const detail = [dog.breed, this.sizeLabel(dog.size)].filter(Boolean).join(' · ');
        addButton(`🐶 ${dog.name}`, detail, () => this.applyDog(dog));
      });
      addButton(this.t('another_dog'), '', () => this.applyDog(null));
      box.hidden = false;
    }

    /** Fills the dog fields with a saved dog, or clears them for a new one (null). */
    applyDog(dog) {
      this.selectedDog = dog;
      if (dog && (dog.favoriteGroomer || dog.lastGroomer)) {
        const pick = dog.favoriteGroomer || dog.lastGroomer;
        const kind = dog.favoriteGroomer ? 'favorite' : 'last';
        if (this.groomersRendered) {
          if ((this.groomers || []).some((g) => g.id === pick)) this.selectGroomer(pick, kind);
        } else {
          // The groomer list has not arrived yet: renderGroomers applies it.
          this.bookingData.groomer = pick;
          this.groomerNoteKind = kind;
        }
      } else if (this.groomersRendered) {
        this.markGroomer();
      }
      const set = (key, value) => {
        const input = this.section.querySelector(`[data-booking-input="${key}"]`);
        if (input) {
          input.value = value || '';
          input.classList.remove('is-invalid');
        }
      };
      set('petName', dog ? dog.name : '');
      set('petBreed', dog ? dog.breed : '');
      set('petAge', dog ? dog.age : '');
      this.bookingData.petBreed = dog ? dog.breed || '' : '';
      const care = new Set(dog ? dog.careNotes || [] : []);
      this.section.querySelectorAll('[data-booking-tag]').forEach((tag) => {
        tag.checked = care.has(tag.value);
      });
      if (dog && ['mini', 'medium', 'large'].includes(dog.size)) {
        const radio = this.section.querySelector(`input[name="dog_size"][value="${dog.size}"]`);
        if (radio && !radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }

    /**
     * Loads the busy times of the next months from the booking app (/apps/reservas/disponibilidad).
     * If the app does not answer, every slot stays available and the app still checks on save.
     */
    loadBusySlots() {
      const from = this.formatDateKey(this.today);
      const to = this.formatDateKey(this.maxDate);
      // Several groomers: busy times of the chosen one, or of nobody free for "any".
      const groomer = encodeURIComponent(this.bookingData.groomer || 'any');
      return fetch(`/apps/reservas/disponibilidad?from=${from}&to=${to}&groomer=${groomer}`, { headers: { Accept: 'application/json' } })
        .then((response) => (response.ok ? response.json() : null))
        .then((result) => {
          if (!result || !result.ok) return;
          this.busy = result.busy || {};
          this.renderGroomers(result.groomers || []);
          this.renderPaymentNote(result.deposit);
          const rebookNote = this.section.querySelector('[data-booking-rebook-note]');
          if (rebookNote) rebookNote.hidden = !result.rebook;
          this.updateAvailableSlots();
          this.renderMiniCalendar();
        })
        .catch(() => {});
    }

    formatDateKey(dateObj) {
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    formatHumanDate(dateStr) {
      if (!dateStr) return '';
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      return this.capitalize(dt.toLocaleDateString(this.locale, options));
    }

    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

    sizeLabel(size) {
      return ['mini', 'medium', 'large'].includes(size) ? this.t(`size_${size}`) : '';
    }

    /** Texts of the page language (snippets/grooming-booking-texts.liquid, locales pet_cro.booking.js). */
    readTexts() {
      const el = this.section.querySelector('[data-booking-texts]');
      let texts = {};
      try {
        texts = el ? JSON.parse(el.textContent) : {};
      } catch (error) {
        return {};
      }
      // Liquid's t filter escapes HTML (' → &#39;); these texts always go in as plain text.
      const decoder = document.createElement('textarea');
      Object.keys(texts).forEach((key) => {
        decoder.innerHTML = texts[key];
        texts[key] = decoder.value;
      });
      return texts;
    }

    /** Translated text with its {{ name }} placeholders filled in. */
    t(key, vars = {}) {
      const text = this.i18n[key] || key;
      return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
    }

    /** Euros in the shop's money format, the same as Liquid's money filter. */
    money(euros) {
      const cents = Math.round(Number(euros || 0) * 100);
      if (typeof formatCroMoney === 'function') return formatCroMoney(cents, this.moneyFormat);
      return new Intl.NumberFormat(this.locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
    }

    /** Length in the page language: 60 → "1 hora", 45 → "45 min", 90 → "1 h 30 min". */
    formatMinutes(total) {
      if (total === 60) return this.t('one_hour');
      if (total < 60) return this.t('minutes', { minutes: total });
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return minutes ? this.t('hours_minutes', { hours, minutes }) : this.t('hours', { hours });
    }

    /**
     * Normalizador de texto para búsquedas tolerantes a acentos, diacríticos y mayúsculas
     */
    normalizeBreedText(str) {
      if (!str) return '';
      return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    }

    /**
     * Motor de Inferencia de Raza y Tamaño
     * Distingue explícitamente entre:
     * - Mestizos / Cruces: size: null (el usuario debe elegir manualmente por peso)
     * - Razas Conocidas: size: 'mini' | 'medium' | 'large' (sugiere y auto-selecciona)
     * - Razas no catalogadas: size: null (permite continuar con elección manual)
     */
    resolveBreedInfo(rawInput) {
      if (!rawInput || typeof rawInput !== 'string') {
        return { isRecognized: false, isMixed: false, size: null, breedName: '', feedbackType: 'empty', feedbackText: '' };
      }

      const clean = rawInput.trim();
      const normalized = this.normalizeBreedText(clean);

      if (!normalized) {
        return { isRecognized: false, isMixed: false, size: null, breedName: '', feedbackType: 'empty', feedbackText: '' };
      }

      // 1. Detección explícita de Mestizo / Cruce / Chucho / Sin raza
      const mixedKeywords = ['mestiz', 'cruc', 'mix', 'chuch', 'sin raza', 'comun', 'callejer', 'mil lech'];
      const isExplicitMixed = mixedKeywords.some((k) => normalized.includes(k));

      if (isExplicitMixed) {
        return {
          isRecognized: true,
          isMixed: true,
          size: null, // NO inferimos tamaño en perros mestizos
          breedName: clean,
          matchedEntry: DOG_BREEDS_CATALOG[0],
          feedbackType: 'mixed',
          feedbackText: this.t('breed_mixed')
        };
      }

      // 2. Búsqueda exacta en catálogo
      for (const entry of DOG_BREEDS_CATALOG) {
        if (entry.isMixed) continue;
        if (this.normalizeBreedText(entry.name) === normalized) {
          return {
            isRecognized: true,
            isMixed: false,
            size: entry.size,
            breedName: entry.name,
            matchedEntry: entry,
            feedbackType: 'recognized',
            feedbackText: this.t('breed_suggested', { size: this.sizeLabel(entry.size), breed: entry.name })
          };
        }
      }

      // 3. Búsqueda por palabras clave o alias
      for (const entry of DOG_BREEDS_CATALOG) {
        if (entry.isMixed) continue;
        for (const kw of entry.keywords) {
          const normKw = this.normalizeBreedText(kw);
          if (normalized === normKw || normalized.includes(normKw)) {
            return {
              isRecognized: true,
              isMixed: false,
              size: entry.size,
              breedName: entry.name,
              matchedEntry: entry,
              feedbackType: 'recognized',
              feedbackText: this.t('breed_suggested', { size: this.sizeLabel(entry.size), breed: entry.name })
            };
          }
        }
      }

      // 4. Raza personalizada o no catalogada
      return {
        isRecognized: false,
        isMixed: false,
        size: null,
        breedName: clean,
        matchedEntry: null,
        feedbackType: 'unknown',
        feedbackText: this.t('breed_unknown')
      };
    }

    /**
     * Manejador reactivo para el buscador de razas en Paso 1
     */
    handleBreedInput(rawVal) {
      const val = (rawVal || '').trim();

      if (this.quickBreedClearBtn) {
        this.quickBreedClearBtn.hidden = val.length === 0;
      }

      if (!val) {
        if (this.breedFeedbackEl) {
          this.breedFeedbackEl.hidden = true;
          this.breedFeedbackEl.className = 'booking-breed-feedback';
        }
        return;
      }

      const res = this.resolveBreedInfo(val);

      if (this.breedFeedbackEl && this.breedFeedbackText) {
        this.breedFeedbackEl.hidden = false;
        this.breedFeedbackEl.className = `booking-breed-feedback is-${res.feedbackType}`;
        this.breedFeedbackText.textContent = res.feedbackText;
      }

      // Si es una raza reconocida con tamaño asignado, auto-seleccionar la tarjeta de tamaño
      if (res.isRecognized && res.size && !res.isMixed) {
        this.bookingData.petBreed = res.breedName;
        this.selectDogSize(res.size);
      } else if (res.isMixed) {
        // En perros mestizos: NO forzamos tamaño. El usuario debe elegir por peso
        this.bookingData.petBreed = val;
      } else {
        // Raza personalizada o no catalogada
        this.bookingData.petBreed = val;
      }
    }

    /**
     * Selecciona programáticamente una tarjeta de tamaño y recalcula precios y extras
     */
    selectDogSize(sizeKey) {
      const targetRadio = this.section.querySelector(`input[name="dog_size"][value="${sizeKey}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
        this.section.querySelectorAll('.booking-size-card').forEach((c) => c.classList.remove('is-selected'));
        const card = targetRadio.closest('.booking-size-card');
        if (card) card.classList.add('is-selected');
        this.bookingData.dogSize = sizeKey;
        this.updatePriceEstimate();
      }
    }

    /**
     * Universal Open Day Check
     * Robustly supports ISO (1=Mon ... 7=Sun) and JS Date (0=Sun, 1=Mon ... 6=Sat).
     * With daysOpen = [1, 2, 3, 4, 5, 6]:
     * - Monday through Saturday are open.
     * - Sunday (0 or 7) is closed.
     */
    isDayOpen(dateObj) {
      if (!this.config || !this.config.daysOpen) {
        return dateObj.getDay() !== 0; // Default: Sunday closed
      }

      const jsDay = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
      const isoDay = jsDay === 0 ? 7 : jsDay; // 1 = Mon ... 7 = Sun

      let openList = this.config.daysOpen;
      if (!Array.isArray(openList)) {
        openList = String(openList).split(',');
      } else if (openList.length === 1 && typeof openList[0] === 'string' && openList[0].includes(',')) {
        openList = openList[0].split(',');
      }

      const openNums = openList
        .map((val) => parseInt(String(val).trim(), 10))
        .filter((val) => !isNaN(val));

      if (openNums.length === 0) {
        return dateObj.getDay() !== 0;
      }

      // If Sunday: requires 0 (JS) or 7 (ISO) in openNums
      if (jsDay === 0) {
        return openNums.includes(0) || openNums.includes(7);
      }

      // Monday through Saturday: jsDay === isoDay (1..6)
      return openNums.includes(jsDay) || openNums.includes(isoDay);
    }

    initEvents() {
      if (this.submitBtn) {
        this.submitBtn.addEventListener('click', () => this.submitBooking());
      }

      // Step Navigation buttons
      this.section.addEventListener('click', (e) => {
        const nextBtn = e.target.closest('[data-wizard-action="next"]');
        if (nextBtn) {
          this.goToNextStep();
          return;
        }

        const prevBtn = e.target.closest('[data-wizard-action="prev"]');
        if (prevBtn) {
          this.goToPrevStep();
          return;
        }

        // Calendar Month navigation
        const prevMonthBtn = e.target.closest('[data-cal-nav="prev"]');
        if (prevMonthBtn) {
          this.changeMonth(-1);
          return;
        }

        const nextMonthBtn = e.target.closest('[data-cal-nav="next"]');
        if (nextMonthBtn) {
          this.changeMonth(1);
          return;
        }
      });

      // Service selection change
      this.section.querySelectorAll('input[name="grooming_service"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
          this.section.querySelectorAll('.booking-service-card').forEach((c) => c.classList.remove('is-selected'));
          const card = e.target.closest('.booking-service-card');
          if (card) card.classList.add('is-selected');
          this.bookingData.serviceId = e.target.value;
          this.updatePriceEstimate();
        });
      });

      // Buscador predictivo de raza / mestizo (Paso 1)
      if (this.quickBreedInput) {
        const onBreedInput = (e) => {
          this.handleBreedInput(e.target.value);
        };
        this.quickBreedInput.addEventListener('input', onBreedInput);
        this.quickBreedInput.addEventListener('change', onBreedInput);
      }

      if (this.quickBreedClearBtn) {
        this.quickBreedClearBtn.addEventListener('click', () => {
          if (this.quickBreedInput) {
            this.quickBreedInput.value = '';
            this.handleBreedInput('');
            this.quickBreedInput.focus();
          }
        });
      }

      // Sincronización de raza en Ficha del Peludo (Paso 3)
      const step3BreedInput = this.section.querySelector('[data-booking-input="petBreed"]');
      if (step3BreedInput) {
        step3BreedInput.addEventListener('input', (e) => {
          const val = e.target.value.trim();
          this.bookingData.petBreed = val;
          if (this.quickBreedInput && !this.quickBreedInput.value.trim() && val) {
            this.quickBreedInput.value = val;
          }
        });
      }

      // Dog size selection change
      this.section.querySelectorAll('input[name="dog_size"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
          this.section.querySelectorAll('.booking-size-card').forEach((c) => c.classList.remove('is-selected'));
          const card = e.target.closest('.booking-size-card');
          if (card) card.classList.add('is-selected');
          this.bookingData.dogSize = e.target.value;
          this.updatePriceEstimate();

          // Feedback dinámico si el usuario ajusta el tamaño manualmente sobre una raza
          if (this.breedFeedbackEl && !this.breedFeedbackEl.hidden && this.quickBreedInput && this.quickBreedInput.value.trim()) {
            const res = this.resolveBreedInfo(this.quickBreedInput.value);
            if (res.isRecognized && res.size && res.size !== e.target.value) {
              if (this.breedFeedbackText) {
                this.breedFeedbackText.textContent = this.t('breed_adjusted', { size: this.sizeLabel(e.target.value), breed: res.breedName });
              }
            }
          }
        });
      });

      // Addons toggle selection change
      this.section.querySelectorAll('input[name="grooming_addon"]').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
          const card = e.target.closest('.booking-addon-card');
          if (card) {
            card.classList.toggle('is-selected', e.target.checked);
          }
          this.updateSelectedAddons();
          this.updatePriceEstimate();
        });
      });

      // Time slot selection change (event delegation to support dynamic slot re-renders)
      if (this.shiftPickerWrap) {
        this.shiftPickerWrap.addEventListener('change', (e) => {
          if (e.target && e.target.name === 'grooming_slot') {
            this.section.querySelectorAll('.booking-slot-card').forEach((c) => c.classList.remove('is-selected'));
            const card = e.target.closest('.booking-slot-card');
            if (card) card.classList.add('is-selected');
            this.bookingData.slot = e.target.value;
          }
        });
      }

      // Apple / Outlook Calendar (.ics download)
      if (this.appleCalendarBtn) {
        this.appleCalendarBtn.addEventListener('click', () => {
          this.downloadIcsFile();
        });
      }

      // Copy booking details button
      if (this.copyBtn) {
        this.copyBtn.addEventListener('click', () => {
          this.copyBookingDetails();
        });
      }

      // WhatsApp, email and SMS: any of them shows the "booking sent" banner.
      if (this.successBanner) {
        this.section.addEventListener('click', (event) => {
          if (event.target.closest('[data-booking-action$="-confirm"]')) {
            this.successBanner.removeAttribute('hidden');
          }
        });
      }
    }

    changeMonth(delta) {
      const nextMonth = new Date(this.currentCalDate);
      nextMonth.setMonth(nextMonth.getMonth() + delta);

      const minMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
      const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
      const targetMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);

      if (targetMonth < minMonth || targetMonth > maxMonth) return;

      this.currentCalDate = nextMonth;
      this.renderMiniCalendar();
    }

    renderMiniCalendar() {
      if (!this.calDaysGrid || !this.calMonthLabel) return;

      const year = this.currentCalDate.getFullYear();
      const month = this.currentCalDate.getMonth();

      // Month & Year header
      const monthName = this.currentCalDate.toLocaleDateString(this.locale, { month: 'long', year: 'numeric' });
      this.calMonthLabel.textContent = this.capitalize(monthName);

      // Boundary check for navigation buttons
      const minMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
      const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
      const curMonth = new Date(year, month, 1);

      if (this.calNavPrev) {
        this.calNavPrev.disabled = curMonth <= minMonth;
      }
      if (this.calNavNext) {
        this.calNavNext.disabled = curMonth >= maxMonth;
      }

      this.calDaysGrid.innerHTML = '';

      // First day of month (0 = Sun, 1 = Mon ... 6 = Sat)
      const firstDay = new Date(year, month, 1);
      const totalDays = new Date(year, month + 1, 0).getDate();

      // Monday-first offset: 0 = Mon ... 6 = Sun
      const startDayOffset = (firstDay.getDay() + 6) % 7;

      // Leading blank padding cells
      for (let i = 0; i < startDayOffset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day-cell is-empty';
        emptyCell.setAttribute('aria-hidden', 'true');
        emptyCell.innerHTML = '&nbsp;';
        this.calDaysGrid.appendChild(emptyCell);
      }

      // Render actual days
      for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dateObj = new Date(year, month, dayNum);
        dateObj.setHours(0, 0, 0, 0);
        const dateKey = this.formatDateKey(dateObj);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday
        // Accessible label: "Lunes 3" / "Monday 3".
        const day = `${this.capitalize(dateObj.toLocaleDateString(this.locale, { weekday: 'long' }))} ${dayNum}`;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal-day-cell';
        btn.textContent = dayNum;
        btn.dataset.calDate = dateKey;

        // Force native CSS Grid positioning for the first day of month
        if (dayNum === 1 && startDayOffset > 0) {
          btn.style.gridColumnStart = String(startDayOffset + 1);
        }

        // Check if today
        if (dateObj.getTime() === this.today.getTime()) {
          btn.classList.add('is-today');
        }

        // Check if selected
        if (dateKey === this.bookingData.date) {
          btn.classList.add('is-selected');
          btn.setAttribute('aria-selected', 'true');
        }

        // Check open days of week & closed holiday dates from Metaobjects
        const isClosedDayOfWeek = !this.isDayOpen(dateObj);
        const isCustomClosedDate = Array.isArray(this.config.closedDates) && this.config.closedDates.includes(dateKey);

        // Check if all slots are fully booked for this day
        const bookedForDay = this.getBookedSlotsForDate(dateKey);
        const isSat = dayOfWeek === 6;
        const dayMorning = (isSat && Array.isArray(this.config.saturdayMorningSlots) && this.config.saturdayMorningSlots.length > 0)
          ? this.config.saturdayMorningSlots
          : (this.config.morningSlots || ['10:00', '11:00', '12:00']);
        const dayAfternoon = isSat
          ? (this.config.saturdayAfternoonSlots || [])
          : (this.config.afternoonSlots || ['17:00', '18:00', '19:00']);
        const totalSlotsCount = dayMorning.length + dayAfternoon.length;
        const isFullyBooked = totalSlotsCount > 0 && bookedForDay.length >= totalSlotsCount;

        // 30-day limit check
        const isPast = dateObj < this.today;
        const isBeyond30 = dateObj > this.maxDate;

        if (isPast || isBeyond30) {
          btn.classList.add('is-disabled');
          btn.title = this.t('day_past', { day });
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else if (isCustomClosedDate) {
          btn.classList.add('is-closed');
          btn.title = this.t('day_holiday', { day });
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else if (isClosedDayOfWeek) {
          btn.classList.add('is-closed');
          btn.title = this.t('day_closed', { day });
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else if (isFullyBooked) {
          // Full day: still clickable, to join its waiting list (step 2).
          btn.classList.add('is-fully-booked');
          btn.title = this.t('day_full', { day });
          btn.setAttribute('aria-label', btn.title);
          btn.addEventListener('click', () => {
            this.bookingData.date = dateKey;
            this.updateSelectedDateDisplay();
            this.updateAvailableSlots();
            this.renderMiniCalendar();
          });
        } else {
          // Clickable available day
          btn.title = this.t('day_available', { day });
          btn.setAttribute('aria-label', btn.title);
          btn.addEventListener('click', () => {
            this.bookingData.date = dateKey;
            this.updateSelectedDateDisplay();
            this.updateAvailableSlots();
            this.renderMiniCalendar();
          });
        }

        this.calDaysGrid.appendChild(btn);
      }

      this.updateSelectedDateDisplay();
    }

    updateSelectedDateDisplay() {
      if (!this.calSelectedDisplay) return;
      if (this.bookingData.date) {
        this.calSelectedDisplay.textContent = this.formatHumanDate(this.bookingData.date);
      } else {
        this.calSelectedDisplay.textContent = this.t('select_day');
      }
    }

    /**
     * Slot start times of a day that overlap an existing appointment, using the busy ranges from
     * the booking app. A slot is taken when [slot, slot + duration) overlaps a busy range, where
     * duration is the longer of the slot length and the length of the booking being made.
     */
    getBookedSlotsForDate(dateStr) {
      const ranges = (dateStr && this.busy[dateStr]) || [];
      if (!ranges.length) return [];
      const toMinutes = (time) => {
        const [h, m] = String(time).split(':').map(Number);
        return h * 60 + m;
      };
      const length = Math.max(this.config.slotDurationMins || 60, this.bookingData.durationMinutes || 0);
      const slots = new Set([
        ...(this.config.morningSlots || []),
        ...(this.config.afternoonSlots || []),
        ...(this.config.saturdayMorningSlots || []),
        ...(this.config.saturdayAfternoonSlots || []),
      ]);
      return [...slots]
        .map((time) => String(time).trim())
        .filter((time) => {
          const start = toMinutes(time);
          const end = start + length;
          return ranges.some(([busyStart, busyEnd]) => start < busyEnd && busyStart < end);
        });
    }

    /**
     * Dynamic Slot Manager:
     * - Saturdays: Only morning slots by default (or custom saturday_morning_slots),
     *   afternoon shift hidden with special notice banner (unless saturday_afternoon_slots configured).
     * - Weekdays (Mon-Fri): Standard morning and afternoon slots.
     * - Anti-collision: Disables already booked slots from internal calendar.
     * - Auto-switches selected slot if previous choice is unavailable on the new date.
     */
    updateAvailableSlots() {
      if (!this.bookingData.date) return;
      const [y, m, d] = this.bookingData.date.split('-').map(Number);
      const selectedDateObj = new Date(y, m - 1, d);
      const isSaturday = selectedDateObj.getDay() === 6;

      const bookedSlots = this.getBookedSlotsForDate(this.bookingData.date);

      const morningList = (isSaturday && Array.isArray(this.config.saturdayMorningSlots) && this.config.saturdayMorningSlots.length > 0)
        ? this.config.saturdayMorningSlots
        : (this.config.morningSlots || ['10:00', '11:00', '12:00']);

      const afternoonList = isSaturday
        ? (this.config.saturdayAfternoonSlots || [])
        : (this.config.afternoonSlots || ['17:00', '18:00', '19:00']);

      const cleanMorning = (Array.isArray(morningList) ? morningList : String(morningList).split(','))
        .map((s) => String(s).trim())
        .filter(Boolean);

      const cleanAfternoon = (Array.isArray(afternoonList) ? afternoonList : String(afternoonList).split(','))
        .map((s) => String(s).trim())
        .filter(Boolean);

      // Render Morning Slots with booked indicators
      if (this.morningSlotsGrid) {
        this.renderSlotCards(this.morningSlotsGrid, cleanMorning, bookedSlots);
      }

      // Render or Hide Afternoon Shift
      if (this.afternoonGroup) {
        if (cleanAfternoon.length > 0) {
          this.afternoonGroup.removeAttribute('hidden');
          if (this.afternoonSlotsGrid) {
            this.renderSlotCards(this.afternoonSlotsGrid, cleanAfternoon, bookedSlots);
          }
        } else {
          this.afternoonGroup.setAttribute('hidden', '');
        }
      }

      // Show/Hide Saturday Special Schedule Notice
      if (this.saturdayNotice) {
        if (isSaturday && cleanAfternoon.length === 0) {
          this.saturdayNotice.removeAttribute('hidden');
        } else {
          this.saturdayNotice.setAttribute('hidden', '');
        }
      }

      // Calculate availability on this day
      const allDaySlots = [...cleanMorning, ...(cleanAfternoon.length > 0 ? cleanAfternoon : [])];
      const availableUnbooked = allDaySlots.filter((time) => !bookedSlots.includes(time));

      // Show/Hide Fully Booked Alert and the waiting list form
      const dayIsFull = allDaySlots.length > 0 && availableUnbooked.length === 0;
      if (this.fullyBookedNotice) {
        if (dayIsFull) {
          this.fullyBookedNotice.removeAttribute('hidden');
        } else {
          this.fullyBookedNotice.setAttribute('hidden', '');
        }
      }
      this.toggleWaitlist(dayIsFull);

      // Ensure valid, unbooked slot selection
      if (!availableUnbooked.includes(this.bookingData.slot)) {
        this.bookingData.slot = availableUnbooked[0] || '';
      }

      this.highlightSelectedSlot();
    }

    renderSlotCards(container, slots, bookedSlots = []) {
      container.innerHTML = '';
      slots.forEach((time) => {
        const isBooked = bookedSlots.includes(time);
        const isSelected = !isBooked && time === this.bookingData.slot;

        const label = document.createElement('label');
        let cardClasses = 'booking-slot-card';
        if (isBooked) {
          cardClasses += ' is-booked is-disabled';
        } else if (isSelected) {
          cardClasses += ' is-selected';
        }
        label.className = cardClasses;
        if (isBooked) {
          label.title = this.t('slot_booked_title', { time });
          label.setAttribute('aria-disabled', 'true');
        }

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'grooming_slot';
        input.value = time;
        input.className = 'visually-hidden';
        if (isBooked) {
          input.disabled = true;
        } else if (isSelected) {
          input.checked = true;
        }

        const span = document.createElement('span');
        span.className = 'slot-time';
        span.textContent = time;

        label.appendChild(input);
        label.appendChild(span);

        if (isBooked) {
          const badge = document.createElement('span');
          badge.className = 'slot-booked-badge';
          badge.textContent = this.t('slot_booked');
          label.appendChild(badge);
        }

        container.appendChild(label);
      });
    }

    highlightSelectedSlot() {
      const allSlotInputs = this.section.querySelectorAll('input[name="grooming_slot"]');
      allSlotInputs.forEach((input) => {
        const isMatch = input.value === this.bookingData.slot;
        input.checked = isMatch;
        const card = input.closest('.booking-slot-card');
        if (card) {
          card.classList.toggle('is-selected', isMatch);
        }
      });
    }

    updatePriceEstimate() {
      // Service durations come as minutes ("60") from the grooming_service metaobject.
      const formatDuration = (value) => {
        const mins = Number.parseInt(value, 10);
        if (!/^\s*\d+\s*$/.test(String(value)) || !mins) return value || this.t('one_hour');
        return this.formatMinutes(mins);
      };

      // CODE-02: prices only from the booking app's services (no example services).
      const servicePrices = {};

      if (Array.isArray(this.config.services) && this.config.services.length > 0) {
        this.config.services.forEach((s) => {
          servicePrices[s.id] = {
            mini: s.mini,
            medium: s.medium,
            large: s.large,
            duration: formatDuration(s.duration),
            // Base length in minutes (the booking app uses the same number).
            minutes: Number.parseInt(s.duration, 10) || 60,
            name: s.name,
          };
        });
      }

      const selected = servicePrices[this.bookingData.serviceId] || Object.values(servicePrices)[0];
      if (!selected) return;
      const basePrice = selected[this.bookingData.dogSize] || selected.mini;

      // Actualizar precios visibles en tarjetas de extras según el tamaño del perro
      this.updateAddonCardsPricing();
      this.updateSelectedAddons();

      // Calcular suma de extras seleccionados
      let addonsTotalPrice = 0;
      let addonsTotalMins = 0;
      if (Array.isArray(this.bookingData.addons)) {
        this.bookingData.addons.forEach((add) => {
          addonsTotalPrice += add.price || 0;
          addonsTotalMins += add.durationMins || 0;
        });
      }

      const totalNumPrice = basePrice + addonsTotalPrice;
      this.bookingData.price = this.money(totalNumPrice);
      this.bookingData.priceAmount = totalNumPrice;

      // Total length: the service's minutes (60 by default) + extras, as the booking app counts it.
      const totalMins = (selected.minutes || 60) + addonsTotalMins;
      this.bookingData.durationMinutes = totalMins;
      this.bookingData.duration = addonsTotalMins > 0 ? this.formatMinutes(totalMins) : selected.duration;
      this.bookingData.serviceName = selected.name;

      // Nothing is preselected (UX-24): no price until the service and the size are chosen.
      const chosen = this.hasStep1Choice();
      if (this.priceEstimateEl) {
        this.priceEstimateEl.textContent = chosen ? this.bookingData.price : '—';
      }
      if (this.durationEstimateEl) {
        this.durationEstimateEl.textContent = chosen
          ? `(⏱️ ${this.bookingData.duration})`
          : this.t('estimate_pending');
      }
    }

    /** Whether the client has chosen a service and a dog size in step 1. */
    hasStep1Choice() {
      return (
        !!this.section.querySelector('input[name="grooming_service"]:checked') &&
        !!this.section.querySelector('input[name="dog_size"]:checked')
      );
    }

    /**
     * Actualiza las etiquetas de precio en cada tarjeta de extra según el tamaño del perro activo
     */
    updateAddonCardsPricing() {
      const currentSize = this.bookingData.dogSize || 'mini';
      this.section.querySelectorAll('.booking-addon-card').forEach((card) => {
        const input = card.querySelector('.booking-addon-input');
        const priceDisplay = card.querySelector('[data-addon-price-display]');
        if (!input || !priceDisplay) return;

        const sizeKey = `price${currentSize.charAt(0).toUpperCase() + currentSize.slice(1)}`;
        let price = parseFloat(input.dataset[sizeKey]);
        if (isNaN(price)) {
          price = parseFloat(input.dataset.price) || 0;
        }
        priceDisplay.textContent = `+${this.money(price)}`;
      });
    }

    /**
     * Recopila los extras seleccionados actualmente con su precio adaptado al tamaño
     */
    updateSelectedAddons() {
      const selected = [];
      const currentSize = this.bookingData.dogSize || 'mini';
      this.section.querySelectorAll('input[name="grooming_addon"]:checked').forEach((cb) => {
        const id = cb.value;
        const card = cb.closest('.booking-addon-card');
        const nameEl = card ? card.querySelector('.booking-addon-name') : null;
        const name = nameEl ? nameEl.textContent.trim() : id;

        const sizeKey = `price${currentSize.charAt(0).toUpperCase() + currentSize.slice(1)}`;
        let price = parseFloat(cb.dataset[sizeKey]);
        if (isNaN(price)) {
          price = parseFloat(cb.dataset.price) || 0;
        }
        const dur = parseInt(cb.dataset.durationMins, 10) || 0;

        selected.push({
          id,
          name,
          price,
          durationMins: dur,
        });
      });
      this.bookingData.addons = selected;
    }

    goToNextStep() {
      if (this.currentStep === 1) {
        // A service and a size must be chosen (nothing is preselected, UX-24).
        const missing = [
          [this.section.querySelector('input[name="grooming_service"]:checked'), '.booking-services-grid'],
          [this.section.querySelector('input[name="dog_size"]:checked'), '.booking-size-grid'],
        ].find(([input]) => !input);
        if (missing) {
          const grid = this.section.querySelector(missing[1]);
          if (grid) {
            grid.classList.add('is-invalid');
            grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => grid.classList.remove('is-invalid'), 1600);
          }
          if (this.durationEstimateEl) this.durationEstimateEl.classList.add('is-warning');
          return;
        }
        if (this.durationEstimateEl) this.durationEstimateEl.classList.remove('is-warning');
        this.currentStep = 2;
      } else if (this.currentStep === 2) {
        if (!this.bookingData.date) {
          const calGrid = this.section.querySelector('[data-booking-calendar-widget]');
          if (calGrid) {
            calGrid.classList.add('is-invalid');
            setTimeout(() => calGrid.classList.remove('is-invalid'), 1000);
          }
          return;
        }
        if (!this.bookingData.slot) {
          const shiftWrap = this.section.querySelector('.booking-shift-picker-wrap');
          if (shiftWrap) {
            shiftWrap.classList.add('is-invalid');
            setTimeout(() => shiftWrap.classList.remove('is-invalid'), 1000);
          }
          return;
        }
        this.currentStep = 3;
      } else if (this.currentStep === 3) {
        // Collect & validate Step 3 inputs
        const petNameInput = this.section.querySelector('[data-booking-input="petName"]');
        const petBreedInput = this.section.querySelector('[data-booking-input="petBreed"]');
        const custNameInput = this.section.querySelector('[data-booking-input="customerName"]');
        const custPhoneInput = this.section.querySelector('[data-booking-input="customerPhone"]');

        // Clear previous errors
        [petNameInput, petBreedInput, custNameInput, custPhoneInput].forEach((inp) => {
          if (inp) {
            inp.classList.remove('is-invalid');
            inp.addEventListener('input', () => inp.classList.remove('is-invalid'), { once: true });
          }
        });

        if (!petNameInput || !petNameInput.value.trim()) {
          if (petNameInput) {
            petNameInput.classList.add('is-invalid');
            petNameInput.focus();
          }
          return;
        }
        if (!petBreedInput || !petBreedInput.value.trim()) {
          if (petBreedInput) {
            petBreedInput.classList.add('is-invalid');
            petBreedInput.focus();
          }
          return;
        }
        if (!custNameInput || !custNameInput.value.trim()) {
          if (custNameInput) {
            custNameInput.classList.add('is-invalid');
            custNameInput.focus();
          }
          return;
        }
        if (!custPhoneInput || !custPhoneInput.value.trim()) {
          if (custPhoneInput) {
            custPhoneInput.classList.add('is-invalid');
            custPhoneInput.focus();
          }
          return;
        }

        // Phone: 9 to 15 digits; email (optional): something@domain.tld
        const phoneValue = custPhoneInput.value.trim();
        const phoneDigits = phoneValue.replace(/\D/g, '');
        if (phoneDigits.length < 9 || phoneDigits.length > 15 || /[^\d\s+().-]/.test(phoneValue)) {
          custPhoneInput.classList.add('is-invalid');
          custPhoneInput.focus();
          return;
        }
        const emailCheckInput = this.section.querySelector('[data-booking-input="customerEmail"]');
        if (emailCheckInput) {
          emailCheckInput.classList.remove('is-invalid');
          const emailValue = emailCheckInput.value.trim();
          if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
            emailCheckInput.classList.add('is-invalid');
            emailCheckInput.addEventListener('input', () => emailCheckInput.classList.remove('is-invalid'), { once: true });
            emailCheckInput.focus();
            return;
          }
        }

        const privacyInput = this.section.querySelector('[data-booking-input="privacyConsent"]');
        const privacyCard = this.section.querySelector('.booking-privacy-card');
        const privacyError = this.section.querySelector('[data-booking-privacy-error]');

        if (privacyInput) {
          privacyInput.addEventListener('change', () => {
            if (privacyCard) privacyCard.classList.remove('has-error');
            if (privacyError) privacyError.hidden = true;
          }, { once: true });
        }

        if (privacyInput && !privacyInput.checked) {
          if (privacyCard) privacyCard.classList.add('has-error');
          if (privacyError) privacyError.hidden = false;
          privacyInput.focus();
          return;
        }

        this.bookingData.petName = petNameInput.value.trim();
        this.bookingData.petBreed = petBreedInput.value.trim();
        this.bookingData.customerName = custNameInput.value.trim();
        this.bookingData.customerPhone = custPhoneInput.value.trim();

        const petAgeInput = this.section.querySelector('[data-booking-input="petAge"]');
        this.bookingData.petAge = petAgeInput ? petAgeInput.value.trim() : '';

        const custEmailInput = this.section.querySelector('[data-booking-input="customerEmail"]');
        this.bookingData.customerEmail = custEmailInput ? custEmailInput.value.trim() : '';

        const notesInput = this.section.querySelector('[data-booking-input="notes"]');
        this.bookingData.notes = notesInput ? notesInput.value.trim() : '';

        // Collect special care tags
        const tags = [];
        this.section.querySelectorAll('[data-booking-tag]:checked').forEach((tag) => {
          tags.push(tag.value);
        });
        this.bookingData.specialNeeds = tags;

        this.populateSummary();
        this.currentStep = 4;
      }

      this.updateStepUI();
    }

    goToPrevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateStepUI();
      }
    }

    updateStepUI() {
      // Update Stepper indicators
      this.stepIndicators.forEach((ind) => {
        const stepNum = parseInt(ind.dataset.stepIndicator, 10);
        ind.classList.toggle('is-active', stepNum === this.currentStep);
        ind.classList.toggle('is-completed', stepNum < this.currentStep);
      });

      // Update Panels visibility
      this.stepPanels.forEach((panel) => {
        const panelNum = parseInt(panel.dataset.stepPanel, 10);
        if (panelNum === this.currentStep) {
          panel.removeAttribute('hidden');
          panel.classList.add('is-active');
        } else {
          panel.setAttribute('hidden', '');
          panel.classList.remove('is-active');
        }
      });

      // If opening Step 2, re-render mini calendar
      if (this.currentStep === 2) {
        this.renderMiniCalendar();
        this.loadBusySlots();
      } else {
        const notice = this.section.querySelector('[data-booking-slot-taken]');
        if (notice) notice.hidden = true;
      }

      // If opening Step 3, pre-fill breed input if already defined in Step 1
      if (this.currentStep === 3) {
        const petBreedInput = this.section.querySelector('[data-booking-input="petBreed"]');
        if (petBreedInput && this.bookingData.petBreed && !petBreedInput.value.trim()) {
          petBreedInput.value = this.bookingData.petBreed;
        }
      }

      // Smooth scroll into view
      this.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    populateSummary() {
      const petNameEl = this.section.querySelector('[data-summary="petName"]');
      const petBreedEl = this.section.querySelector('[data-summary="petBreed"]');
      const priceEl = this.section.querySelector('[data-summary="price"]');
      const serviceEl = this.section.querySelector('[data-summary="serviceName"]');
      const scheduleEl = this.section.querySelector('[data-summary="schedule"]');
      const customerEl = this.section.querySelector('[data-summary="customerInfo"]');
      const specialEl = this.section.querySelector('[data-summary="specialNeeds"]');

      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const durationTag = this.bookingData.duration || this.t('one_hour');

      if (petNameEl) petNameEl.textContent = this.bookingData.petName;
      if (petBreedEl) {
        const breedDisplay = this.bookingData.petBreed || this.t('mixed_breed');
        const sizeTag = this.sizeLabel(this.bookingData.dogSize);
        petBreedEl.textContent = sizeTag ? `${breedDisplay} (${sizeTag})` : breedDisplay;
      }
      if (priceEl) priceEl.textContent = this.bookingData.price;
      if (serviceEl) serviceEl.textContent = this.bookingData.serviceName;
      if (scheduleEl) scheduleEl.textContent = `${this.formatHumanDate(this.bookingData.date)} · ${this.bookingData.slot} - ${endSlot} h (${durationTag})`;
      const groomerRow = this.section.querySelector('[data-summary-groomer-row]');
      if (groomerRow) {
        groomerRow.hidden = (this.groomers || []).length < 2;
        const groomerEl = this.section.querySelector('[data-summary="groomer"]');
        if (groomerEl) groomerEl.textContent = this.groomerName() || this.t('groomer_any_summary');
      }
      if (customerEl) customerEl.textContent = `${this.bookingData.customerName} · ${this.bookingData.customerPhone}`;
      if (specialEl) {
        specialEl.textContent = this.bookingData.specialNeeds.length > 0 ? this.bookingData.specialNeeds.join(', ') : this.t('no_special');
      }

      // Extras of the summary card (names from the shop: text, never HTML).
      const addonsWrap = this.section.querySelector('[data-summary-addons-wrap]');
      const addonsListEl = this.section.querySelector('[data-summary="addonsList"]');
      const addons = Array.isArray(this.bookingData.addons) ? this.bookingData.addons : [];
      if (addonsWrap && addonsListEl) {
        addonsWrap.hidden = addons.length === 0;
        addonsListEl.replaceChildren(
          ...addons.map((a) => {
            const pill = document.createElement('span');
            pill.className = 'conf-addon-pill';
            pill.textContent = `✨ ${a.name} `;
            const price = document.createElement('strong');
            price.textContent = `(+${this.money(a.price)})`;
            pill.appendChild(price);
            return pill;
          })
        );
      }

      // Build WhatsApp Link
      let cleanPhone = (this.whatsappNumber || '').replace(/\D/g, '');
      if (cleanPhone.length === 9 && (cleanPhone.startsWith('6') || cleanPhone.startsWith('7'))) {
        cleanPhone = '34' + cleanPhone;
      }

      const msg = this.bookingMessage('whatsapp');

      if (this.whatsappCta) {
        this.whatsappCta.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      }

      // Google Calendar link, in the salon's time zone
      if (this.gcalLink && this.bookingData.date && this.bookingData.slot) {
        const ev = this.calendarEventData();
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: ev.title,
          dates: `${ev.start}/${ev.end}`,
          ctz: SALON_TIME_ZONE,
          details: ev.details,
          location: ev.location,
        });
        this.gcalLink.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
      }

      // Build Email Confirmation Link (Funcionalidad 5)
      if (this.emailConfirmBtn) {
        this.emailConfirmBtn.href = this.buildEmailConfirmationLink();
      }

      // Build SMS Confirmation Link (Funcionalidad 5)
      if (this.smsConfirmBtn) {
        this.smsConfirmBtn.href = this.buildSmsConfirmationLink();
      }

      // Populate Salon Address & Maps Navigation Link (Funcionalidad 4)
      const salonAddressEl = this.section.querySelector('[data-summary="salonAddress"]');
      if (salonAddressEl && this.salonAddress) {
        salonAddressEl.textContent = this.salonAddress;
      }
      if (this.mapsBtn) {
        this.mapsBtn.href = this.buildMapsNavigationUrl('auto');
      }

    }

    /**
     * Sends the appointment to the booking app (app proxy /apps/reservas/citas), which saves it in
     * Shopify as a pending appointment. WhatsApp, email and calendar buttons are shown afterwards.
     */
    submitBooking() {
      if (this.submitting || this.bookingData.savedReference || !this.submitBtn) return;
      const label = this.submitBtn.querySelector('span') || this.submitBtn;
      const originalLabel = label.textContent;
      const websiteInput = this.section.querySelector('[data-booking-input="website"]');
      const marketingInput = this.section.querySelector('[data-booking-input="marketingOptIn"]');

      const payload = {
        date: this.bookingData.date,
        time: this.bookingData.slot,
        service: this.bookingData.serviceName,
        // Ids (metaobject handles): the booking app works out the price and length from them.
        serviceId: this.bookingData.serviceId,
        addonIds: (this.bookingData.addons || []).map((addon) => addon.id),
        dogSize: this.bookingData.dogSize,
        durationMinutes: this.bookingData.durationMinutes,
        price: this.bookingData.priceAmount,
        addons: (this.bookingData.addons || []).map((addon) => addon.name),
        petName: this.bookingData.petName,
        petBreed: this.bookingData.petBreed,
        petAge: this.bookingData.petAge,
        careNotes: this.bookingData.specialNeeds,
        ownerName: this.bookingData.customerName,
        ownerPhone: this.bookingData.customerPhone,
        ownerEmail: this.bookingData.customerEmail,
        notes: this.bookingData.notes,
        groomer: this.bookingData.groomer || 'any',
        saveFavoriteGroomer: !!(this.section.querySelector('[data-booking-fav]') || {}).checked,
        website: websiteInput ? websiteInput.value : '',
        marketingOptIn: !!(marketingInput && marketingInput.checked),
        locale: document.documentElement.lang || 'es',
      };

      this.submitting = true;
      this.submitBtn.disabled = true;
      this.submitBtn.setAttribute('aria-busy', 'true');
      label.textContent = this.t('sending');
      this.showSubmitStatus('', '');

      fetch('/apps/reservas/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json().catch(() => ({ ok: false, error: 'invalid_response' })))
        .then((result) => {
          if (result && result.ok) {
            this.bookingData.savedReference = result.reference || result.id;
            this.onBookingSaved(result.deposit);
            return;
          }
          if (result && result.error === 'slot_taken') {
            this.onSlotTaken(label, originalLabel);
            return;
          }
          if (result && result.error === 'too_many_pending') {
            this.onBookingFailed(
              this.t('too_many_pending'),
              label,
              originalLabel
            );
            return;
          }
          const fieldNames = {
            date: 'field_date',
            time: 'field_time',
            service: 'field_service',
            dogSize: 'field_dog_size',
            petName: 'field_pet_name',
            ownerName: 'field_owner_name',
            ownerPhone: 'field_owner_phone',
            ownerEmail: 'field_owner_email',
          };
          const fields = ((result && result.fields) || []).filter((field) => fieldNames[field]).map((field) => this.t(fieldNames[field]));
          const message = fields.length ? this.t('invalid_fields', { fields: fields.join(', ') }) : this.t('save_failed');
          this.onBookingFailed(message, label, originalLabel);
        })
        .catch(() => {
          this.onBookingFailed(
            this.t('save_no_connection'),
            label,
            originalLabel
          );
        });
    }

    onBookingSaved(deposit) {
      this.submitting = false;
      this.submitBtn.hidden = true;
      this.submitBtn.removeAttribute('aria-busy');
      const required = deposit && deposit.mode === 'required';
      this.showSubmitStatus('is-success', this.t(required ? 'saved_pay_deposit' : 'saved'));
      this.showDeposit(deposit);
      if (this.afterSubmit) this.afterSubmit.hidden = false;
      // The booking is saved: going back to edit would create a second one.
      const prevBtn = this.section.querySelector('[data-step-panel="4"] [data-wizard-action="prev"]');
      if (prevBtn) prevBtn.hidden = true;
    }

    /** Deposit link from the booking app (Shopify checkout of a draft order), when deposits are on. */
    showDeposit(deposit) {
      const box = this.section.querySelector('[data-booking-deposit]');
      if (!box || !deposit || !deposit.url) return;
      const amount = this.money(deposit.amount);
      const text = box.querySelector('[data-booking-deposit-text]');
      const link = box.querySelector('[data-booking-deposit-link]');
      const note = box.querySelector('[data-booking-deposit-note]');
      if (deposit.mode !== 'required') {
        text.textContent = this.t('deposit_optional', { amount });
      } else if (deposit.dueAt) {
        // Payment deadline in the salon's time zone, whatever the visitor's device says.
        const due = new Date(deposit.dueAt);
        const opts = { timeZone: SALON_TIME_ZONE };
        const day = due.toLocaleDateString(this.locale, { ...opts, weekday: 'long', day: 'numeric', month: 'long' });
        const time = due.toLocaleTimeString(this.locale, { ...opts, hour: '2-digit', minute: '2-digit', hour12: false });
        text.textContent = this.t('deposit_required_by', { amount, day, time });
      } else {
        text.textContent = this.t('deposit_required', { amount });
      }
      link.href = deposit.url;
      link.textContent = this.t('deposit_pay', { amount });
      if (deposit.mode === 'demo') {
        note.textContent = this.t('deposit_demo');
        note.hidden = false;
      }
      box.hidden = false;
    }

    // The time was booked by someone else meanwhile: reload busy times and go back to step 2.
    onSlotTaken(label, originalLabel) {
      this.submitting = false;
      this.submitBtn.disabled = false;
      this.submitBtn.removeAttribute('aria-busy');
      label.textContent = originalLabel;
      this.showSubmitStatus('', '');
      const notice = this.section.querySelector('[data-booking-slot-taken]');
      if (notice) {
        notice.textContent = this.t('slot_taken');
        notice.hidden = false;
      }
      this.loadBusySlots().then(() => {
        this.currentStep = 2;
        this.updateStepUI();
      });
    }

    onBookingFailed(message, label, originalLabel) {
      this.submitting = false;
      this.submitBtn.disabled = false;
      this.submitBtn.removeAttribute('aria-busy');
      label.textContent = originalLabel;
      this.showSubmitStatus('is-error', message);
      // WhatsApp stays available as a fallback.
      if (this.afterSubmit) this.afterSubmit.hidden = false;
    }

    showSubmitStatus(type, message) {
      if (!this.submitStatus) return;
      this.submitStatus.classList.remove('is-success', 'is-error');
      if (!message) {
        this.submitStatus.hidden = true;
        this.submitStatus.textContent = '';
        return;
      }
      if (type) this.submitStatus.classList.add(type);
      this.submitStatus.textContent = message;
      this.submitStatus.hidden = false;
    }

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
     * Calculate appointment end time based on slot duration (default 60 mins) and selected extras
     * e.g. 10:00 -> 11:00, or 10:00 + 15 min extras -> 11:15
     */
    calculateEndTime(startStr) {
      if (!startStr) return '11:00';
      const [h, m] = startStr.split(':').map(Number);
      const slotDuration = this.config.slotDurationMins || 60;
      let extraMins = 0;
      if (this.bookingData && Array.isArray(this.bookingData.addons)) {
        this.bookingData.addons.forEach((ad) => {
          extraMins += ad.durationMins || 0;
        });
      }
      const totalMins = (h || 10) * 60 + (m || 0) + slotDuration + extraMins;
      const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
      const endM = String(totalMins % 60).padStart(2, '0');
      return `${endH}:${endM}`;
    }

    /**
     * Paso 1 (Funcionalidad 2): Generador iCalendar (.ics / RFC 5545)
     * Compatible con Apple Calendar (iOS / macOS), Microsoft Outlook y Android nativo.
     * Incorpora dos alarmas automáticas (VALARM): 2 horas antes y 1 día antes para evitar no-shows.
     */
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

  function initGroomingBookingWizards() {
    document.querySelectorAll('.grooming-booking-section').forEach((section) => {
      // Without bookable services the section shows a notice instead of the form (CODE-02).
      if (!section.querySelector('[data-step-panel]')) return;
      if (!section.__groomingBookingWizard) {
        const wizard = new GroomingBookingWizard(section);
        section.__groomingBookingWizard = wizard;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGroomingBookingWizards);
  } else {
    initGroomingBookingWizards();
  }
})();

