/**
 * Native Dog Grooming Appointment Booking Controller
 * File: assets/grooming-booking.js
 * Architecture: Clean Vanilla JS, 30-Day Mini-Calendar, Dynamic Pricing & WhatsApp Direct Booking
 */

(function () {
  'use strict';

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
      this.whatsappNumber = section.dataset.whatsappNumber || '+34 612 345 678';
      this.salonAddress = section.dataset.salonAddress || 'Calle Amor de Mascota 12, Madrid';
      this.salonEmail = section.dataset.salonEmail || '';
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
      const initialServiceId = checkedService ? checkedService.value : (this.config.services[0]?.id || 'bath_hygiene');
      const checkedSlot = section.querySelector('input[name="grooming_slot"]:checked');
      const initialSlot = checkedSlot ? checkedSlot.value : '10:00';

      // State
      this.bookingData = {
        bookingId: null,
        savedReference: null,
        serviceId: initialServiceId,
        serviceName: 'Baño Dermoprotector & Oídos',
        dogSize: 'mini',
        dogSizeLabel: 'Mini / Toy (<5 kg)',
        addons: [],
        price: '28,00 €',
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
      this.updatePriceEstimate();
      this.updateAvailableSlots();
      this.renderMiniCalendar();
      this.loadBusySlots();
      this.loadMyDogs();
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
      const isEn = document.documentElement.lang === 'en';
      const options = [{ id: 'any', name: isEn ? 'No preference' : 'Sin preferencia', bio: isEn ? 'Whoever is free' : 'La que esté libre' }, ...groomers];
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
      const isEn = document.documentElement.lang === 'en';
      const dog = this.selectedDog;
      const name = this.groomerName();
      // Why this groomer is proposed: the dog's favourite, or who groomed it last time.
      let note = '';
      if (dog && name && this.groomerNoteKind === 'favorite' && current === dog.favoriteGroomer) {
        note = isEn ? `⭐ ${name} is ${dog.name}'s favourite groomer.` : `⭐ ${name} es la peluquera favorita de ${dog.name}.`;
      } else if (dog && name && this.groomerNoteKind === 'last' && current === dog.lastGroomer) {
        note = isEn ? `${name} groomed ${dog.name} last time.` : `${name} atendió a ${dog.name} la última vez.`;
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
          ? (isEn ? `⭐ Save ${name} as ${dog.name}'s favourite groomer` : `⭐ Guardar a ${name} como peluquera favorita de ${dog.name}`)
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
      const isEn = document.documentElement.lang === 'en';
      const sizeLabels = isEn
        ? { mini: 'Mini / Toy', medium: 'Medium', large: 'Large' }
        : { mini: 'Mini / Toy', medium: 'Mediano', large: 'Grande' };

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
        const detail = [dog.breed, sizeLabels[dog.size]].filter(Boolean).join(' · ');
        addButton(`🐶 ${dog.name}`, detail, () => this.applyDog(dog));
      });
      addButton(isEn ? '➕ Another dog' : '➕ Otro perro', '', () => this.applyDog(null));
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
      const isEn = document.documentElement.lang === 'en';
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const raw = dt.toLocaleDateString(isEn ? 'en-US' : 'es-ES', options);
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    /**
     * Catálogo público de razas para componentes UI (Datalist / Selector)
     */
    getBreedsCatalog() {
      return DOG_BREEDS_CATALOG;
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
          feedbackText: 'Perro mestizo o cruce: al no tener un tamaño estándar, selecciona abajo el tamaño y peso que mejor se adapte a tu peludo.'
        };
      }

      // 2. Búsqueda exacta en catálogo
      for (const entry of DOG_BREEDS_CATALOG) {
        if (entry.isMixed) continue;
        if (this.normalizeBreedText(entry.name) === normalized) {
          const sizeLabel = entry.size === 'mini' ? 'Mini / Toy (<5 kg)' : entry.size === 'medium' ? 'Mediano (5 a 15 kg)' : 'Grande (>15 kg)';
          return {
            isRecognized: true,
            isMixed: false,
            size: entry.size,
            breedName: entry.name,
            matchedEntry: entry,
            feedbackType: 'recognized',
            feedbackText: `Tamaño sugerido automáticamente: ${sizeLabel} para ${entry.name}. (Puedes cambiarlo abajo si tu peludo tiene un peso diferente).`
          };
        }
      }

      // 3. Búsqueda por palabras clave o alias
      for (const entry of DOG_BREEDS_CATALOG) {
        if (entry.isMixed) continue;
        for (const kw of entry.keywords) {
          const normKw = this.normalizeBreedText(kw);
          if (normalized === normKw || normalized.includes(normKw)) {
            const sizeLabel = entry.size === 'mini' ? 'Mini / Toy (<5 kg)' : entry.size === 'medium' ? 'Mediano (5 a 15 kg)' : 'Grande (>15 kg)';
            return {
              isRecognized: true,
              isMixed: false,
              size: entry.size,
              breedName: entry.name,
              matchedEntry: entry,
              feedbackType: 'recognized',
              feedbackText: `Tamaño sugerido automáticamente: ${sizeLabel} para ${entry.name}. (Puedes cambiarlo abajo si tu peludo tiene un peso diferente).`
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
        feedbackText: 'Raza personalizada: selecciona abajo el tamaño y peso que mejor represente a tu perro.'
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
              const customSizeLabel = e.target.value === 'mini' ? 'Mini / Toy' : e.target.value === 'medium' ? 'Mediano' : 'Grande';
              if (this.breedFeedbackText) {
                this.breedFeedbackText.textContent = `✓ Tamaño ajustado manualmente a ${customSizeLabel} para ${res.breedName}.`;
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

      // WhatsApp button confirmation click feedback
      if (this.whatsappCta) {
        this.whatsappCta.addEventListener('click', () => {
          this.bookingData.channel = 'whatsapp';
          if (this.successBanner) {
            this.successBanner.removeAttribute('hidden');
          }
        });
      }

      // Email button confirmation click feedback & auto-sync (Funcionalidad 5)
      if (this.emailConfirmBtn) {
        this.emailConfirmBtn.addEventListener('click', () => {
          this.bookingData.channel = 'email';
          if (this.successBanner) {
            this.successBanner.removeAttribute('hidden');
          }
        });
      }

      // SMS button confirmation click feedback & auto-sync (Funcionalidad 5)
      if (this.smsConfirmBtn) {
        this.smsConfirmBtn.addEventListener('click', () => {
          this.bookingData.channel = 'sms';
          if (this.successBanner) {
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

      const isEn = document.documentElement.lang === 'en';
      const year = this.currentCalDate.getFullYear();
      const month = this.currentCalDate.getMonth();

      // Month & Year header
      const monthName = this.currentCalDate.toLocaleDateString(isEn ? 'en-US' : 'es-ES', {
        month: 'long',
        year: 'numeric',
      });
      this.calMonthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

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

      // Day name arrays for unambiguous accessibility labels
      const weekdayNamesEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const weekdayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Render actual days
      for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dateObj = new Date(year, month, dayNum);
        dateObj.setHours(0, 0, 0, 0);
        const dateKey = this.formatDateKey(dateObj);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday
        const dayName = isEn ? weekdayNamesEn[dayOfWeek] : weekdayNamesEs[dayOfWeek];

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
          btn.title = isEn ? `${dayName} ${dayNum} (Past date)` : `${dayName} ${dayNum} (Fecha pasada)`;
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else if (isCustomClosedDate) {
          btn.classList.add('is-closed');
          btn.title = isEn ? `${dayName} ${dayNum} (Closed / Holiday)` : `${dayName} ${dayNum} (Cerrado / Festivo)`;
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else if (isClosedDayOfWeek) {
          btn.classList.add('is-closed');
          btn.title = dayOfWeek === 0
            ? (isEn ? `Sunday ${dayNum} (Closed on Sundays)` : `Domingo ${dayNum} (Cerrado los domingos)`)
            : (isEn ? `${dayName} ${dayNum} (Closed)` : `${dayName} ${dayNum} (Cerrado por horario)`);
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else if (isFullyBooked) {
          btn.classList.add('is-fully-booked', 'is-closed');
          btn.title = isEn ? `${dayName} ${dayNum} (Fully booked)` : `${dayName} ${dayNum} (Completo / Sin citas disponibles)`;
          btn.setAttribute('aria-label', btn.title);
          btn.disabled = true;
        } else {
          // Clickable available day
          btn.title = isEn ? `${dayName} ${dayNum} (Available for booking)` : `${dayName} ${dayNum} (Disponible para reserva)`;
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
        const isEn = document.documentElement.lang === 'en';
        this.calSelectedDisplay.textContent = isEn ? 'Select an available day' : 'Selecciona un día en el calendario';
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

      // Show/Hide Fully Booked Alert
      if (this.fullyBookedNotice) {
        if (allDaySlots.length > 0 && availableUnbooked.length === 0) {
          this.fullyBookedNotice.removeAttribute('hidden');
        } else {
          this.fullyBookedNotice.setAttribute('hidden', '');
        }
      }

      // Ensure valid, unbooked slot selection
      if (!availableUnbooked.includes(this.bookingData.slot)) {
        this.bookingData.slot = availableUnbooked[0] || '';
      }

      this.highlightSelectedSlot();
    }

    renderSlotCards(container, slots, bookedSlots = []) {
      container.innerHTML = '';
      const isEn = document.documentElement.lang === 'en';
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
          label.title = isEn ? `${time} - Already booked` : `${time} - Franja ya reservada`;
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
          badge.textContent = isEn ? 'Booked' : 'Ocupado';
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
      const isEn = document.documentElement.lang === 'en';
      const defaultDuration = isEn ? '1 hour' : '1 hora';

      const servicePrices = {
        bath_hygiene: { mini: 28, medium: 34, large: 42, duration: defaultDuration, name: isEn ? 'Dermoprotective Bath & Ears' : 'Baño Dermoprotector & Oídos' },
        scissor_cut: { mini: 38, medium: 46, large: 58, duration: defaultDuration, name: isEn ? 'Breed Scissor Cut & Styling' : 'Corte a Tijera de Raza & Peinado' },
        deshedding: { mini: 35, medium: 42, large: 52, duration: defaultDuration, name: isEn ? 'Full Deshedding & Bath' : 'Deslanado Completo & Baño' },
        spa_ozone: { mini: 42, medium: 50, large: 62, duration: defaultDuration, name: isEn ? 'Ozone Spa Therapy & Mask' : 'Spa Ozonoterapia & Mascarilla' },
      };

      if (Array.isArray(this.config.services) && this.config.services.length > 0) {
        this.config.services.forEach((s) => {
          servicePrices[s.id] = {
            mini: s.mini || 28,
            medium: s.medium || 34,
            large: s.large || 42,
            duration: s.duration || defaultDuration,
            name: s.name,
          };
        });
      }

      const selected = servicePrices[this.bookingData.serviceId] || Object.values(servicePrices)[0] || servicePrices.bath_hygiene;
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
      this.bookingData.price = `${totalNumPrice},00 €`;
      this.bookingData.priceAmount = totalNumPrice;

      // Calcular duración total (base 60 mins + extras)
      const totalMins = 60 + addonsTotalMins;
      this.bookingData.durationMinutes = totalMins;
      if (totalMins > 60) {
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        this.bookingData.duration = mins > 0 ? `${hours} h ${mins} min` : `${hours} horas`;
      } else {
        this.bookingData.duration = selected.duration || defaultDuration;
      }
      this.bookingData.serviceName = selected.name;

      if (this.priceEstimateEl) {
        this.priceEstimateEl.textContent = this.bookingData.price;
      }
      if (this.durationEstimateEl) {
        this.durationEstimateEl.textContent = `(⏱️ ${this.bookingData.duration})`;
      }
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
        priceDisplay.textContent = `+${price},00 €`;
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

    /**
     * Calcula el precio del extra según el tamaño del perro (modelo flexible: precio fijo o escalonado)
     */
    getAddonPrice(addon, dogSize = this.bookingData.dogSize) {
      if (!addon) return 0;
      const sizeKey = `price_${dogSize}`;
      if (typeof addon[sizeKey] === 'number') {
        return addon[sizeKey];
      }
      return typeof addon.price === 'number' ? addon.price : 0;
    }

    goToNextStep() {
      if (this.currentStep === 1) {
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

      const isEn = document.documentElement.lang === 'en';
      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const durationTag = this.bookingData.duration || (isEn ? '1 hour' : '1 hora');

      if (petNameEl) petNameEl.textContent = this.bookingData.petName;
      if (petBreedEl) {
        const breedDisplay = this.bookingData.petBreed || (isEn ? 'Mixed breed' : 'Mestizo / Sin raza');
        const sizeTag = this.bookingData.dogSize ? this.bookingData.dogSize.toUpperCase() : '';
        petBreedEl.textContent = sizeTag ? `${breedDisplay} (${sizeTag})` : breedDisplay;
      }
      if (priceEl) priceEl.textContent = this.bookingData.price;
      if (serviceEl) serviceEl.textContent = this.bookingData.serviceName;
      if (scheduleEl) scheduleEl.textContent = `${this.formatHumanDate(this.bookingData.date)} · ${this.bookingData.slot} - ${endSlot} h (${durationTag})`;
      const groomerRow = this.section.querySelector('[data-summary-groomer-row]');
      if (groomerRow) {
        const several = (this.groomers || []).length > 1;
        groomerRow.hidden = !several;
        const isEnSummary = document.documentElement.lang === 'en';
        const groomerEl = this.section.querySelector('[data-summary="groomer"]');
        if (groomerEl) groomerEl.textContent = this.groomerName() || (isEnSummary ? 'No preference (whoever is free)' : 'Sin preferencia (la que esté libre)');
      }
      if (customerEl) customerEl.textContent = `${this.bookingData.customerName} · ${this.bookingData.customerPhone}`;
      if (specialEl) {
        specialEl.textContent = this.bookingData.specialNeeds.length > 0 ? this.bookingData.specialNeeds.join(', ') : (isEn ? 'No special needs' : 'Sin particularidades especiales');
      }

      // Populate Extra Add-ons in Summary Card
      const addonsWrap = this.section.querySelector('[data-summary-addons-wrap]');
      const addonsListEl = this.section.querySelector('[data-summary="addonsList"]');
      const hasAddons = Array.isArray(this.bookingData.addons) && this.bookingData.addons.length > 0;

      if (addonsWrap && addonsListEl) {
        if (hasAddons) {
          addonsWrap.removeAttribute('hidden');
          addonsListEl.innerHTML = this.bookingData.addons
            .map((a) => `<span class="conf-addon-pill">✨ ${a.name} <strong>(+${a.price},00 €)</strong></span>`)
            .join(' ');
        } else {
          addonsWrap.setAttribute('hidden', '');
          addonsListEl.innerHTML = '';
        }
      }

      // Build WhatsApp Link
      let cleanPhone = (this.whatsappNumber || '').replace(/\D/g, '');
      if (cleanPhone.length === 9 && (cleanPhone.startsWith('6') || cleanPhone.startsWith('7'))) {
        cleanPhone = '34' + cleanPhone;
      }

      const addonsWhatsAppStr = hasAddons
        ? `✨ *Cuidados extra:* ` + this.bookingData.addons.map((a) => `${a.name} (+${a.price},00 €)`).join(', ') + `\n`
        : '';

      const msg =
        `🐾 *¡SOLICITUD DE CITA DE PELUQUERÍA CANINA!* 🐾\n\n` +
        `👤 *Tutor:* ${this.bookingData.customerName}\n` +
        `📱 *Teléfono:* ${this.bookingData.customerPhone}\n\n` +
        `🐶 *Peludo:* ${this.bookingData.petName} (${this.bookingData.petBreed} - Tamaño ${this.bookingData.dogSize.toUpperCase()})\n` +
        (this.bookingData.petAge ? `🎂 *Edad:* ${this.bookingData.petAge}\n` : '') +
        `✂️ *Servicio base:* ${this.bookingData.serviceName}\n` +
        addonsWhatsAppStr +
        `📅 *Fecha solicitada:* ${this.formatHumanDate(this.bookingData.date)}\n` +
        `⏰ *Horario:* ${this.bookingData.slot} - ${endSlot} h (${durationTag})\n` +
        `💶 *Precio estimado:* ${this.bookingData.price}\n` +
        (this.bookingData.specialNeeds.length > 0 ? `⚠️ *Cuidados especiales:* ${this.bookingData.specialNeeds.join(', ')}\n` : '') +
        (this.bookingData.notes ? `📝 *Notas:* ${this.bookingData.notes}\n` : '') +
        `\n¿Tenéis disponibilidad para confirmarme la cita? ¡Muchas gracias! 🐶`;

      if (this.whatsappCta) {
        this.whatsappCta.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      }

      // Build Google Calendar Link (strict 1-hour event)
      if (this.gcalLink && this.bookingData.date && this.bookingData.slot) {
        const [y, m, d] = this.bookingData.date.split('-');
        const [sh, sm] = this.bookingData.slot.split(':');
        const startIso = `${y}${m}${d}T${sh}${sm}00`;
        const endIso = `${y}${m}${d}T${endSlot.replace(':', '')}00`;

        const addonsGCalStr = hasAddons
          ? `\nExtras añadidos: ` + this.bookingData.addons.map((a) => `${a.name} (+${a.price},00 €)`).join(', ')
          : '';

        const title = `Peluquería Canina: ${this.bookingData.serviceName} para ${this.bookingData.petName}`;
        const details = `Cita de peluquería canina para ${this.bookingData.petName} (${this.bookingData.petBreed}).\nHorario: ${this.bookingData.slot} - ${endSlot} h (${durationTag})\nServicio: ${this.bookingData.serviceName}${addonsGCalStr}\nPrecio estimado: ${this.bookingData.price}\nContacto: ${this.bookingData.customerPhone}`;
        const location = this.section.dataset.salonAddress || 'Peluquería Canina';

        this.gcalLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
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
     * Customer and pet data in the shape Shopify expects. Kept for the booking app (phase 1 of
     * docs/revision-todo.md): the old hidden newsletter form subscribed every booking to marketing
     * without consent, so it was removed on 2026-11-19.
     */
    prepareCustomerPayload(channel = 'whatsapp') {
      const activeChannel = channel || this.bookingData.channel || 'whatsapp';
      const rawName = (this.bookingData.customerName || '').trim();
      const nameParts = rawName.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const email = (this.bookingData.customerEmail || '').trim();
      const phone = (this.bookingData.customerPhone || '').trim();

      const sanitizeTag = (str) =>
        String(str || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

      const tags = ['peluqueria-canina'];
      tags.push(`canal-${sanitizeTag(activeChannel)}`);
      if (this.bookingData.petName) {
        tags.push(`perro-${sanitizeTag(this.bookingData.petName)}`);
      }
      if (this.bookingData.petBreed) {
        const normBreed = this.normalizeBreedText(this.bookingData.petBreed);
        const isMixedTag = ['mestiz', 'cruc', 'mix', 'chuch', 'sin raza', 'comun'].some((k) => normBreed.includes(k));
        tags.push(isMixedTag ? 'raza-mestizo' : `raza-${sanitizeTag(this.bookingData.petBreed)}`);
      }
      if (this.bookingData.dogSize) {
        tags.push(`tamano-${sanitizeTag(this.bookingData.dogSize)}`);
      }
      if (Array.isArray(this.bookingData.specialNeeds) && this.bookingData.specialNeeds.length > 0) {
        this.bookingData.specialNeeds.forEach((sn) => {
          tags.push(`cuidado-${sanitizeTag(sn)}`);
        });
      }
      tags.push('rgpd-consentimiento-aceptado');
      const tagsString = tags.join(', ');

      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const petAgeStr = this.bookingData.petAge ? `${this.bookingData.petAge} ${isNaN(this.bookingData.petAge) ? '' : 'años'}`.trim() : 'No indicada';
      const careNotesStr = this.bookingData.specialNeeds && this.bookingData.specialNeeds.length > 0 ? this.bookingData.specialNeeds.join(', ') : 'Ninguno específico';
      const addNotesStr = this.bookingData.notes ? this.bookingData.notes : 'Sin observaciones adicionales';

      const customerNote = [
        '🐾 FICHA DE PELUQUERÍA CANINA & MASCOTA',
        '---------------------------------------',
        `• Peludo: ${this.bookingData.petName || 'N/A'}`,
        `• Raza: ${this.bookingData.petBreed || 'Mestizo'}`,
        `• Tamaño: ${this.bookingData.dogSizeLabel || this.bookingData.dogSize}`,
        `• Edad: ${petAgeStr}`,
        `• Cuidados especiales: ${careNotesStr}`,
        `• Observaciones: ${addNotesStr}`,
        '',
        '📅 ÚLTIMA RESERVA REGISTRADA:',
        `• Fecha y Hora: ${this.formatHumanDate(this.bookingData.date)} · ${this.bookingData.slot} - ${endSlot} h`,
        `• Servicio: ${this.bookingData.serviceName} (${this.bookingData.price})`,
        `• Canal de confirmación: ${activeChannel.toUpperCase()}`,
        `• Teléfono de contacto: ${phone || 'N/A'}`,
        `• Consentimiento RGPD / LOPD: Aceptado expresamente por el tutor (${new Date().toLocaleDateString('es-ES')})`,
      ].join('\n');

      return {
        firstName,
        lastName,
        email,
        phone,
        tags: tagsString,
        note: customerNote,
      };
    }

    /**
     * Sends the appointment to the booking app (app proxy /apps/reservas/citas), which saves it in
     * Shopify as a pending appointment. WhatsApp, email and calendar buttons are shown afterwards.
     */
    submitBooking() {
      // savedReference is the app's appointment; bookingId belongs to the old in-browser agenda.
      if (this.submitting || this.bookingData.savedReference || !this.submitBtn) return;
      const isEn = document.documentElement.lang === 'en';
      const label = this.submitBtn.querySelector('span') || this.submitBtn;
      const originalLabel = label.textContent;
      const websiteInput = this.section.querySelector('[data-booking-input="website"]');
      const marketingInput = this.section.querySelector('[data-booking-input="marketingOptIn"]');

      const payload = {
        date: this.bookingData.date,
        time: this.bookingData.slot,
        service: this.bookingData.serviceName,
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
      label.textContent = isEn ? 'Sending…' : 'Enviando…';
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
            this.onBookingSaved(isEn, result.deposit);
            return;
          }
          if (result && result.error === 'slot_taken') {
            this.onSlotTaken(isEn, label, originalLabel);
            return;
          }
          const fieldNames = isEn
            ? { date: 'date', time: 'time', service: 'service', dogSize: 'dog size', petName: "dog's name", ownerName: 'your name', ownerPhone: 'phone', ownerEmail: 'email' }
            : { date: 'fecha', time: 'hora', service: 'servicio', dogSize: 'tamaño', petName: 'nombre del perro', ownerName: 'tu nombre', ownerPhone: 'teléfono', ownerEmail: 'email' };
          const fields = ((result && result.fields) || []).map((field) => fieldNames[field]).filter(Boolean);
          const message = fields.length
            ? (isEn
                ? 'Some details are not valid. Go back and check them: ' + fields.join(', ') + '.'
                : 'Hay datos que no son válidos. Vuelve atrás y revísalos: ' + fields.join(', ') + '.')
            : (isEn
                ? 'We could not save your booking. Please try again, or send it to us by WhatsApp.'
                : 'No hemos podido guardar tu reserva. Vuelve a intentarlo o envíanosla por WhatsApp.');
          this.onBookingFailed(message, label, originalLabel);
        })
        .catch(() => {
          this.onBookingFailed(
            isEn
              ? 'No connection. Please try again, or send your booking by WhatsApp.'
              : 'Sin conexión. Vuelve a intentarlo o envíanos la reserva por WhatsApp.',
            label,
            originalLabel
          );
        });
    }

    onBookingSaved(isEn, deposit) {
      this.submitting = false;
      this.submitBtn.hidden = true;
      this.submitBtn.removeAttribute('aria-busy');
      const required = deposit && deposit.mode === 'required';
      this.showSubmitStatus(
        'is-success',
        required
          ? (isEn
              ? 'Booking saved! Pay the deposit below to confirm it.'
              : '¡Reserva guardada! Paga la señal aquí abajo para confirmarla.')
          : (isEn
              ? 'Booking received! The salon will confirm it soon. You can also let us know by WhatsApp or add it to your calendar.'
              : '¡Reserva recibida! La peluquería te la confirmará pronto. Si quieres, avísanos también por WhatsApp o añádela a tu calendario.')
      );
      this.showDeposit(isEn, deposit);
      if (this.afterSubmit) this.afterSubmit.hidden = false;
      // The booking is saved: going back to edit would create a second one.
      const prevBtn = this.section.querySelector('[data-step-panel="4"] [data-wizard-action="prev"]');
      if (prevBtn) prevBtn.hidden = true;
    }

    /** Deposit link from the booking app (Shopify checkout of a draft order), when deposits are on. */
    showDeposit(isEn, deposit) {
      const box = this.section.querySelector('[data-booking-deposit]');
      if (!box || !deposit || !deposit.url) return;
      const amount = new Intl.NumberFormat(isEn ? 'en-IE' : 'es-ES', { style: 'currency', currency: 'EUR' }).format(deposit.amount);
      const text = box.querySelector('[data-booking-deposit-text]');
      const link = box.querySelector('[data-booking-deposit-link]');
      const note = box.querySelector('[data-booking-deposit-note]');
      let until = '';
      if (deposit.dueAt) {
        const due = new Date(deposit.dueAt);
        const opts = { timeZone: 'Europe/Madrid' };
        const day = due.toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { ...opts, weekday: 'long', day: 'numeric', month: 'long' });
        const time = due.toLocaleTimeString('es-ES', { ...opts, hour: '2-digit', minute: '2-digit', hour12: false });
        until = isEn ? ` before ${day} at ${time}` : ` antes del ${day} a las ${time}`;
      }
      text.textContent =
        deposit.mode === 'required'
          ? (isEn
              ? `To confirm your appointment, pay a ${amount} deposit${until}; otherwise the time will be released. It is taken off the final price.`
              : `Para confirmar tu cita, paga una señal de ${amount}${until}; si no, la hora se liberará. Se descuenta del precio final.`)
          : (isEn
              ? `Want to secure your appointment? Pay a ${amount} deposit now; it is taken off the final price.`
              : `¿Quieres asegurar tu cita? Paga ahora una señal de ${amount}; se descuenta del precio final.`);
      link.href = deposit.url;
      link.textContent = isEn ? `Pay deposit (${amount})` : `Pagar señal (${amount})`;
      if (deposit.mode === 'demo') {
        note.textContent = isEn
          ? 'Test site: the payment is a test and nothing real is charged (use card number 1).'
          : 'Web en pruebas: el pago es de prueba y no se cobra nada real (usa la tarjeta número 1).';
        note.hidden = false;
      }
      box.hidden = false;
    }

    // The time was booked by someone else meanwhile: reload busy times and go back to step 2.
    onSlotTaken(isEn, label, originalLabel) {
      this.submitting = false;
      this.submitBtn.disabled = false;
      this.submitBtn.removeAttribute('aria-busy');
      label.textContent = originalLabel;
      this.showSubmitStatus('', '');
      const notice = this.section.querySelector('[data-booking-slot-taken]');
      if (notice) {
        notice.textContent = isEn
          ? 'Sorry, someone has just booked that time. Please choose another one.'
          : 'Vaya, alguien acaba de reservar esa hora. Elige otra, por favor.';
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
      const isEn = document.documentElement.lang === 'en';
      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const durationTag = this.bookingData.duration || (isEn ? '1 hour' : '1 hora');
      const hasAddons = Array.isArray(this.bookingData.addons) && this.bookingData.addons.length > 0;
      const addonsCopyStr = hasAddons
        ? `Extras: ` + this.bookingData.addons.map((a) => `${a.name} (+${a.price},00 €)`).join(', ') + `\n`
        : '';
      const summaryText =
        `🐾 Cita de Peluquería Canina\n` +
        `Peludo: ${this.bookingData.petName} (${this.bookingData.petBreed} - ${this.bookingData.dogSize.toUpperCase()})\n` +
        `Servicio: ${this.bookingData.serviceName} (${this.bookingData.price})\n` +
        addonsCopyStr +
        `Horario: ${this.formatHumanDate(this.bookingData.date)} · ${this.bookingData.slot} - ${endSlot} h (${durationTag})\n` +
        `Tutor: ${this.bookingData.customerName} (${this.bookingData.customerPhone})\n` +
        (this.bookingData.specialNeeds.length ? `Cuidados: ${this.bookingData.specialNeeds.join(', ')}\n` : '');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText).then(() => {
          const orig = this.copyBtn.textContent;
          this.copyBtn.textContent = '✓ ¡Copiado!';
          setTimeout(() => {
            this.copyBtn.textContent = orig;
          }, 2000);
        }).catch(() => {
          alert('Detalles de la cita:\n\n' + summaryText);
        });
      } else {
        alert('Detalles de la cita:\n\n' + summaryText);
      }
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
    generateIcsContent() {
      if (!this.bookingData.date || !this.bookingData.slot) return null;

      const dateClean = this.bookingData.date.replace(/-/g, ''); // YYYYMMDD
      const [sh, sm] = this.bookingData.slot.split(':');
      const dtStart = `${dateClean}T${sh.padStart(2, '0')}${sm.padStart(2, '0')}00`;

      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const [eh, em] = endSlot.split(':');
      const dtEnd = `${dateClean}T${eh.padStart(2, '0')}${em.padStart(2, '0')}00`;

      const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const domain = typeof window !== 'undefined' && window.location && window.location.hostname ? window.location.hostname : 'shopify-store';
      const uid = (this.bookingData.bookingId || ('grooming-' + Date.now())) + '@' + domain;

      const petName = this.bookingData.petName || 'Tu peludo';
      const petBreed = this.bookingData.petBreed || '';
      const summary = `🐾 Cita de Peluquería Canina: ${this.bookingData.serviceName} para ${petName}`;

      const location = (this.section.dataset.salonAddress || 'Calle Amor de Mascota 12, Madrid')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');

      const hasAddons = Array.isArray(this.bookingData.addons) && this.bookingData.addons.length > 0;
      const addonsText = hasAddons
        ? `\\nExtras incluidos: ` + this.bookingData.addons.map((a) => `${a.name} (+${a.price}€)`).join(', ')
        : '';

      const careText = this.bookingData.specialNeeds && this.bookingData.specialNeeds.length > 0
        ? `\\nCuidados especiales: ${this.bookingData.specialNeeds.join(', ')}`
        : '';

      const notesText = this.bookingData.notes
        ? `\\nObservaciones: ${this.bookingData.notes}`
        : '';

      const description =
        `Cita de Peluquería Canina y Spa para ${petName} (${petBreed} - ${this.bookingData.dogSize.toUpperCase()}).\\n` +
        `Servicio: ${this.bookingData.serviceName} (${this.bookingData.price})` +
        addonsText +
        careText +
        notesText +
        `\\nTutor: ${this.bookingData.customerName || 'Cliente'} (${this.bookingData.customerPhone || ''})\\n` +
        `Ubicación: ${this.section.dataset.salonAddress || 'En tienda'}`;

      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Shopify Grooming Booking//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT2H',
        'ACTION:DISPLAY',
        `DESCRIPTION:🐾 Recordatorio: Cita de peluquería para ${petName} en 2 horas`,
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:🐾 Recordatorio: Cita de peluquería para ${petName} mañana`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
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

      // Compatibilidad Legacy IE/Edge
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
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
      }

      // Feedback visual temporal en el botón
      if (this.appleCalendarBtn) {
        const origText = this.appleCalendarBtn.textContent;
        const isEn = document.documentElement.lang === 'en';
        this.appleCalendarBtn.textContent = isEn ? 'Descargado' : 'Descargado';
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
      const isEn = document.documentElement.lang === 'en';
      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const durationTag = this.bookingData.duration || (isEn ? '1 hour' : '1 hora');
      const petName = this.bookingData.petName || (isEn ? 'Pet' : 'Peludo');
      const petBreed = this.bookingData.petBreed || (isEn ? 'Mixed breed' : 'Mestizo / Sin raza');
      const dogSizeTag = this.bookingData.dogSize ? this.bookingData.dogSize.toUpperCase() : '';
      const humanDate = this.formatHumanDate(this.bookingData.date);

      const subject = isEn
        ? `Dog Grooming Appointment: ${petName} (${humanDate} · ${this.bookingData.slot}h)`
        : `Cita de Peluquería Canina: ${petName} (${humanDate} · ${this.bookingData.slot}h)`;

      const hasAddons = Array.isArray(this.bookingData.addons) && this.bookingData.addons.length > 0;
      const addonsStr = hasAddons
        ? this.bookingData.addons.map((a) => `${a.name} (+${a.price},00 €)`).join(', ')
        : '';

      const specialStr = Array.isArray(this.bookingData.specialNeeds) && this.bookingData.specialNeeds.length > 0
        ? this.bookingData.specialNeeds.join(', ')
        : '';

      const salonAddress = this.section.dataset.salonAddress || 'Calle Amor de Mascota 12, Madrid';

      const bodyLines = [
        isEn ? 'Hello! I would like to confirm the following dog grooming appointment:' : '¡Hola! Deseo confirmar la siguiente cita de peluquería canina:',
        '',
        isEn ? '🐾 PET DETAILS' : '🐾 DATOS DE LA MASCOTA',
        '----------------------------------------',
        `• ${isEn ? 'Name' : 'Nombre'}: ${petName}`,
        `• ${isEn ? 'Breed' : 'Raza / Cruce'}: ${petBreed} (${isEn ? 'Size' : 'Tamaño'} ${dogSizeTag})`,
        this.bookingData.petAge ? `• ${isEn ? 'Age' : 'Edad'}: ${this.bookingData.petAge}` : null,
        `• ${isEn ? 'Main service' : 'Servicio principal'}: ${this.bookingData.serviceName}`,
        hasAddons ? `• ${isEn ? 'Extras' : 'Cuidados extra'}: ${addonsStr}` : null,
        `• ${isEn ? 'Estimated price' : 'Tarifa estimada'}: ${this.bookingData.price}`,
        '',
        isEn ? '📅 DATE & LOCATION' : '📅 FECHA Y UBICACIÓN',
        '----------------------------------------',
        `• ${isEn ? 'Date' : 'Día'}: ${humanDate}`,
        `• ${isEn ? 'Time slot' : 'Franja horaria'}: ${this.bookingData.slot} - ${endSlot} h (${durationTag})`,
        `• ${isEn ? 'Address' : 'Salón'}: ${salonAddress}`,
        '',
        isEn ? '👤 PET PARENT DETAILS' : '👤 DATOS DEL TUTOR',
        '----------------------------------------',
        `• ${isEn ? 'Full name' : 'Tutor/a'}: ${this.bookingData.customerName || 'N/A'}`,
        `• ${isEn ? 'Phone' : 'Teléfono'}: ${this.bookingData.customerPhone || 'N/A'}`,
        this.bookingData.customerEmail ? `• Email: ${this.bookingData.customerEmail}` : null,
        specialStr ? `• ${isEn ? 'Special needs' : 'Necesidades especiales'}: ${specialStr}` : null,
        this.bookingData.notes ? `• ${isEn ? 'Notes' : 'Observaciones'}: ${this.bookingData.notes}` : null,
        '',
        isEn ? 'Please confirm if the booking is scheduled. Thank you!' : '¿Me confirmáis si la cita queda anotada? ¡Muchas gracias!'
      ].filter(Boolean);

      const body = bodyLines.join('\n');
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

      const isEn = document.documentElement.lang === 'en';
      const petName = this.bookingData.petName || (isEn ? 'Pet' : 'Peludo');
      const petBreed = this.bookingData.petBreed || (isEn ? 'Mixed breed' : 'Mestizo');
      const endSlot = this.calculateEndTime(this.bookingData.slot);
      const humanDate = this.formatHumanDate(this.bookingData.date);

      const hasAddons = Array.isArray(this.bookingData.addons) && this.bookingData.addons.length > 0;
      const addonsSummary = hasAddons
        ? ` + Extras: ` + this.bookingData.addons.map((a) => a.name).join(', ')
        : '';

      const smsText = isEn
        ? `Hello, I'd like to confirm a grooming appointment for ${petName} (${petBreed}). Date: ${humanDate} at ${this.bookingData.slot}-${endSlot}h. Service: ${this.bookingData.serviceName}${addonsSummary} (${this.bookingData.price}). Parent: ${this.bookingData.customerName} (Phone: ${this.bookingData.customerPhone}).`
        : `Hola, quiero confirmar cita de peluquería para ${petName} (${petBreed}). Día: ${humanDate} a las ${this.bookingData.slot}-${endSlot}h. Servicio: ${this.bookingData.serviceName}${addonsSummary} (${this.bookingData.price}). Tutor: ${this.bookingData.customerName} (Tel: ${this.bookingData.customerPhone}).`;

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
      const address = this.salonAddress || this.section.dataset.salonAddress || 'Calle Amor de Mascota 12, Madrid';
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }

    /**
     * Paso 1 (Funcionalidad 4): Generador de URL de navegación para Apple Maps
     * Optimizado para macOS y dispositivos iOS
     */
    buildAppleMapsUrl() {
      const address = this.salonAddress || this.section.dataset.salonAddress || 'Calle Amor de Mascota 12, Madrid';
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

  window.groomingBookingInstances = window.groomingBookingInstances || [];

  window.refreshAllGroomingBookings = function () {
    window.groomingBookingInstances.forEach((inst) => {
      if (inst && typeof inst.renderMiniCalendar === 'function') {
        inst.updatePriceEstimate();
        inst.renderMiniCalendar();
        inst.updateSelectedDateDisplay();
      }
    });
  };

  function initGroomingBookingWizards() {
    document.querySelectorAll('.grooming-booking-section').forEach((section) => {
      if (!section.__groomingBookingWizard) {
        const wizard = new GroomingBookingWizard(section);
        section.__groomingBookingWizard = wizard;
        window.groomingBookingInstances.push(wizard);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGroomingBookingWizards);
  } else {
    initGroomingBookingWizards();
  }
})();

