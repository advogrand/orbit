export const contacts = {
  email: 'stay@orbithouse.ru',
  phone: '+7 (495) 128-27-08',
  telegram: '@orbit_house_retreat',
};

export const contactLinks = {
  email: `mailto:${contacts.email}`,
  phone: `tel:${contacts.phone.replace(/[^\d+]/g, '')}`,
  telegram: `https://t.me/${contacts.telegram.replace('@', '')}`,
};
