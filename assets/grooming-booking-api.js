/**
 * Calls to the booking app through the app proxy (/apps/reservas/*) for the grooming booking (CODE-09).
 * File: assets/grooming-booking-api.js. Used by assets/grooming-booking.js.
 * Each call returns a promise with the app's JSON answer; a network error rejects it.
 */

(function () {
  'use strict';

  const BASE = '/apps/reservas';
  const JSON_HEADERS = { Accept: 'application/json' };

  /** GET: the JSON answer, or null when the app answers with an error. */
  function getJson(path) {
    return fetch(`${BASE}${path}`, { headers: JSON_HEADERS }).then((response) => (response.ok ? response.json() : null));
  }

  /** POST: the JSON answer (also on errors, which carry { ok: false, error }), or `fallback` if it is not JSON. */
  function postJson(path, body, fallback) {
    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { ...JSON_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((response) => response.json().catch(() => fallback));
  }

  const ns = (window.GroomingBooking = window.GroomingBooking || {});

  // Same time zone the booking app uses for the salon schedule.
  ns.SALON_TIME_ZONE = 'Europe/Madrid';

  ns.api = {
    /** Busy times, groomers and deposit setting between two dates (YYYY-MM-DD). */
    availability({ from, to, groomer }) {
      const query = new URLSearchParams({ from, to, groomer });
      return getJson(`/disponibilidad?${query}`);
    },
    /** Contact details and saved dogs of the logged-in customer. */
    myDogs() {
      return getJson('/mis-perros');
    },
    /** Waiting list for a fully booked day. */
    joinWaitlist(entry) {
      return postJson('/lista-espera', entry, { ok: false });
    },
    /** Saves the appointment as pending. */
    saveBooking(booking) {
      return postJson('/citas', booking, { ok: false, error: 'invalid_response' });
    },
  };
})();
