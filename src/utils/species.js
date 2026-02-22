const poultryTypes = new Set([
  'poultry',
  'chicken',
  'hen',
  'rooster',
  'broiler',
  'layer',
  'duck',
  'goose',
  'turkey',
  'quail',
  'guinea fowl',
  'guineafowl'
])

const tagPrefixByType = new Map([
  ['cattle', 'C-'],
  ['cow', 'C-'],
  ['bull', 'C-'],
  ['heifer', 'C-'],
  ['goat', 'G-'],
  ['goats', 'G-'],
  ['sheep', 'S-'],
  ['ram', 'S-'],
  ['ewe', 'S-'],
  ['pig', 'P-'],
  ['swine', 'P-'],
  ['boar', 'P-'],
  ['sow', 'P-'],
  ['horse', 'H-'],
  ['mare', 'H-'],
  ['stallion', 'H-'],
  ['donkey', 'DN-'],
  ['ass', 'DN-'],
  ['mule', 'DN-'],
  ['camel', 'CM-'],
  ['buffalo', 'BF-'],
  ['rabbit', 'RB-'],
  ['chicken', 'CH-'],
  ['hen', 'CH-'],
  ['rooster', 'CH-'],
  ['broiler', 'CH-'],
  ['layer', 'CH-'],
  ['duck', 'DK-'],
  ['goose', 'GS-'],
  ['turkey', 'TK-'],
  ['quail', 'Q-'],
  ['guinea fowl', 'GF-'],
  ['guineafowl', 'GF-']
])

export function getSpeciesProfile(species) {
  const v = String(species || '').trim().toLowerCase()
  if (!v) return 'mammal'
  return poultryTypes.has(v) ? 'poultry' : 'mammal'
}

export function getTagPrefixForType(animalType) {
  const v = String(animalType || '').trim().toLowerCase()
  if (!v) return ''
  return tagPrefixByType.get(v) || ''
}
