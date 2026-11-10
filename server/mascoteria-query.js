const petRows = `
  SELECT p.id, p.name, p.animal, p.location, p.version, c.id AS ownerId, c.PERSONAJE AS ownerName
  FROM pets p
  LEFT JOIN pet_owners po ON po.pet_id = p.id
  LEFT JOIN characters c ON c.id = po.character_id
  WHERE p.is_deleted = 0
`;
const alphabetical = new Intl.Collator('es');
const compareNames = (a, b) => alphabetical.compare(a.name, b.name) || a.id.localeCompare(b.id);
const uniqueText = values => [...new Set(values.filter(Boolean))].sort(alphabetical.compare);

function comparePets(a, b) {
  const locationPriority = Number(b.location === 'Mascotería') - Number(a.location === 'Mascotería');
  const emptyAnimalLast = Number(!a.animal) - Number(!b.animal);
  return locationPriority || emptyAnimalLast || alphabetical.compare(a.animal, b.animal) || compareNames(a, b);
}

function collectPets(rows) {
  const pets = new Map();
  for (const { ownerId, ownerName, ...pet } of rows) {
    if (!pets.has(pet.id)) pets.set(pet.id, { ...pet, owners: [] });
    if (ownerId) pets.get(pet.id).owners.push({ id: ownerId, name: ownerName });
  }
  for (const pet of pets.values()) pet.owners.sort(compareNames);
  return [...pets.values()].sort(comparePets);
}

export async function queryPets(db, params) {
  const size = params.get('pageSize') ?? '50';
  const requestedPage = Number(params.get('page') ?? '1');
  if (!['20', '50', '100', 'all'].includes(size) || !Number.isSafeInteger(requestedPage) || requestedPage < 1) {
    throw new RangeError('Paginación inválida.');
  }
  const search = (params.get('search') ?? '').trim().normalize('NFC').toLowerCase();
  const owner = params.get('owner');
  const animal = params.get('animal');
  const location = params.get('location');
  const [rows, characters] = await db.batch([
    db.prepare(petRows),
    db.prepare("SELECT id, PERSONAJE AS name FROM characters WHERE is_deleted = 0 AND trim(PERSONAJE) <> ''")
  ]);
  const pets = collectPets(rows.results);
  const matches = pets.filter(pet =>
    pet.name.normalize('NFC').toLowerCase().includes(search) &&
    (owner === null || (owner === '' ? !pet.owners.length : pet.owners.some(item => item.id === owner))) &&
    (animal === null || pet.animal === animal) &&
    (location === null || pet.location === location)
  );
  const pageCount = size === 'all' ? 1 : Math.max(1, Math.ceil(matches.length / Number(size)));
  const page = Math.min(requestedPage, pageCount);
  const offset = (page - 1) * Number(size);
  return {
    pets: size === 'all' ? matches : matches.slice(offset, offset + Number(size)),
    activeOwners: characters.results.sort(compareNames),
    filters: {
      owners: [...new Map(pets.flatMap(pet => pet.owners.map(item => [item.id, item]))).values()].sort(compareNames),
      animals: uniqueText(pets.map(pet => pet.animal)),
      locations: uniqueText(pets.map(pet => pet.location))
    },
    pagination: { page, pageCount, totalMatches: matches.length, totalRecords: pets.length }
  };
}
