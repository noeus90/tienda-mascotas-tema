/**
 * Dog breed catalogue and lookup for the grooming booking (CODE-09).
 * File: assets/grooming-breeds.js. Used by assets/grooming-booking.js, which adds the notice text.
 */

(function () {
  'use strict';

  /**
   * Catálogo Inteligente de Razas Caninas y Mestizos
   * Los perros mestizos/cruces tienen size: null porque su peso no puede inferirse automáticamente.
   */
  const catalog = [
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

  /**
   * Normalizador de texto para búsquedas tolerantes a acentos, diacríticos y mayúsculas
   */
  function normalize(str) {
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
  function resolve(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') {
      return { isRecognized: false, isMixed: false, size: null, breedName: '', feedbackType: 'empty' };
    }

    const clean = rawInput.trim();
    const normalized = normalize(clean);

    if (!normalized) {
      return { isRecognized: false, isMixed: false, size: null, breedName: '', feedbackType: 'empty' };
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
        matchedEntry: catalog[0],
        feedbackType: 'mixed'
      };
    }

    // 2. Búsqueda exacta en catálogo
    for (const entry of catalog) {
      if (entry.isMixed) continue;
      if (normalize(entry.name) === normalized) {
        return {
          isRecognized: true,
          isMixed: false,
          size: entry.size,
          breedName: entry.name,
          matchedEntry: entry,
          feedbackType: 'recognized'
        };
      }
    }

    // 3. Búsqueda por palabras clave o alias
    for (const entry of catalog) {
      if (entry.isMixed) continue;
      for (const kw of entry.keywords) {
        const normKw = normalize(kw);
        if (normalized === normKw || normalized.includes(normKw)) {
          return {
            isRecognized: true,
            isMixed: false,
            size: entry.size,
            breedName: entry.name,
            matchedEntry: entry,
            feedbackType: 'recognized'
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
      feedbackType: 'unknown'
    };
  }

  const ns = (window.GroomingBooking = window.GroomingBooking || {});
  ns.breeds = { catalog, normalize, resolve };
})();
