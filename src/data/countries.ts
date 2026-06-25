export type VisaCategory = 'tourist' | 'business' | 'student' | 'family';

export interface Country {
  id: string;
  code: 'PK' | 'IN' | 'AO' | 'MA' | 'DZ' | 'EG';
  flag: string;
  nameKey: string; // References keys in locales (e.g., 'countries.pakistan')
  vacs: string[];
  visaCategories: VisaCategory[];
}

export const countries: Country[] = [
  {
    id: 'pakistan',
    code: 'PK',
    flag: '🇵🇰',
    nameKey: 'countries.pakistan',
    vacs: ['Islamabad VAC', 'Karachi VAC', 'Lahore VAC', 'Peshawar VAC'],
    visaCategories: ['tourist', 'business', 'student', 'family'],
  },
  {
    id: 'india',
    code: 'IN',
    flag: '🇮🇳',
    nameKey: 'countries.india',
    vacs: ['New Delhi VAC', 'Mumbai VAC', 'Chennai VAC', 'Kolkata VAC', 'Bengaluru VAC'],
    visaCategories: ['tourist', 'business', 'student', 'family'],
  },
  {
    id: 'angola',
    code: 'AO',
    flag: '🇦🇴',
    nameKey: 'countries.angola',
    vacs: ['Luanda VAC'],
    visaCategories: ['tourist', 'business', 'student'],
  },
  {
    id: 'morocco',
    code: 'MA',
    flag: '🇲🇦',
    nameKey: 'countries.morocco',
    vacs: ['Rabat VAC', 'Casablanca VAC', 'Marrakesh VAC', 'Tangier VAC', 'Nador VAC'],
    visaCategories: ['tourist', 'business', 'student', 'family'],
  },
  {
    id: 'algeria',
    code: 'DZ',
    flag: '🇩🇿',
    nameKey: 'countries.algeria',
    vacs: ['Algiers VAC', 'Oran VAC', 'Constantine VAC'],
    visaCategories: ['tourist', 'business', 'student', 'family'],
  },
  {
    id: 'egypt',
    code: 'EG',
    flag: '🇪🇬',
    nameKey: 'countries.egypt',
    vacs: ['Cairo VAC', 'Alexandria VAC'],
    visaCategories: ['tourist', 'business', 'student', 'family'],
  },
];
