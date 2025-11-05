import axios from 'axios';
import { load as loadHtml } from 'cheerio';

// Cache in memory for simplicity
let cachedStates = null;
const cachedDistrictsByState = new Map();

const BASE_URL = 'https://igod.gov.in/sg/district/states';

export async function getStates() {
  if (cachedStates) return cachedStates;
  const resp = await axios.get(BASE_URL, { timeout: 15000 });
  const $ = loadHtml(resp.data);
  // The page lists states as bullet items; extract text
  const states = [];
  $('li').each((_, el) => {
    const text = $(el).text().trim();
    // Heuristic: include only known state/UT names (alpha, spaces)
    if (/^[A-Za-z .&()-]+$/.test(text) && text.length > 3 && text.length < 40) {
      states.push(text);
    }
  });
  // De-duplicate and sort
  const uniqueStates = Array.from(new Set(states)).sort((a, b) => a.localeCompare(b));
  cachedStates = uniqueStates;
  return uniqueStates;
}

export async function getDistrictsByState(stateName) {
  if (cachedDistrictsByState.has(stateName)) {
    return cachedDistrictsByState.get(stateName);
  }
  // Best-effort: try to find a link containing the state, then fetch its page
  const resp = await axios.get(BASE_URL, { timeout: 15000 });
  const $ = loadHtml(resp.data);
  let stateHref = null;
  $('a').each((_, a) => {
    const text = $(a).text().trim();
    if (text.toLowerCase() === stateName.toLowerCase()) {
      stateHref = $(a).attr('href');
    }
  });

  let districts = [];
  if (stateHref) {
    try {
      const url = stateHref.startsWith('http') ? stateHref : new URL(stateHref, BASE_URL).toString();
      const stResp = await axios.get(url, { timeout: 15000 });
      const _$ = loadHtml(stResp.data);
      _$('li, a').each((_, el) => {
        const text = _$(el).text().trim();
        if (/^[A-Za-z .&()-]+$/.test(text) && text.length > 2 && text.length < 50) {
          districts.push(text);
        }
      });
    } catch {
      // fallthrough to heuristic
    }
  }

  // Fallback: if no link or parsing failed, return empty to avoid blocking UI
  districts = Array.from(new Set(districts));
  cachedDistrictsByState.set(stateName, districts);
  return districts;
}


