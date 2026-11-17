import type { ChildProfile, SuggestionItem } from '../types';

export interface AlternativesResponse {
  suggestions: SuggestionItem[];
  message?: string;
  error?: string;
}

let pending: {
  id: string;
  resolve: (response: AlternativesResponse) => void;
  reject: (error: Error) => void;
  timeout: number;
} | undefined;

function send(type: string, data: object) {
  window.parent.postMessage({ isStreamlitMessage: true, type, ...data }, window.location.origin);
}

export function connectToStreamlit() {
  if (window.parent === window) return;

  let lastHeight = 0;
  const syncHeight = () => {
    const height = Math.max(1, window.innerHeight);
    if (height !== lastHeight) {
      lastHeight = height;
      send('streamlit:setFrameHeight', { height });
    }
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== window.location.origin ||
        event.data?.type !== 'streamlit:render') return;

    syncHeight();
    const reply = event.data.args?.reply;
    if (!pending || !reply || reply.id !== pending.id) return;

    const active = pending;
    pending = undefined;
    window.clearTimeout(active.timeout);
    if (reply.error) {
      active.reject(new Error(reply.error));
    } else {
      active.resolve(reply);
    }
  });
  window.addEventListener('resize', syncHeight);
  send('streamlit:componentReady', { apiVersion: 1 });
  syncHeight();
}

export function fetchAlternativesApi(
  childProfile: ChildProfile,
  childRequest: string,
  maxSuggestions: number,
): Promise<AlternativesResponse> {
  if (window.parent === window) {
    return Promise.reject(new Error('כדי לקבל חלופות, פתחו את YumWise דרך Streamlit.'));
  }

  if (pending) {
    window.clearTimeout(pending.timeout);
    pending.reject(new Error('הבקשה הוחלפה בבקשה חדשה.'));
  }

  const id = window.crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pending = undefined;
      reject(new Error('התשובה התעכבה. נסו שוב בעוד רגע.'));
    }, 60000);
    pending = { id, resolve, reject, timeout };
    send('streamlit:setComponentValue', {
      dataType: 'json',
      value: {
        id,
        inputType: 'text',
        childRequest,
        allergens: childProfile.allergens,
        dietaryRestrictions: childProfile.customDietaryRestrictions,
        maxSuggestions,
      },
    });
  });
}
