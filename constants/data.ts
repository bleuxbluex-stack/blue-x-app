export const PROVIDER_IMAGES = {
  clean: 'https://images.pexels.com/photos/9222631/pexels-photo-9222631.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  plumbing: 'https://images.pexels.com/photos/32588556/pexels-photo-32588556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  electric: 'https://images.pexels.com/photos/1325725/pexels-photo-1325725.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  painting: 'https://images.pexels.com/photos/8486978/pexels-photo-8486978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
} as const;

export const providers = [
  { id: 'alpine-clean', name: 'AlpineClean', service: 'Cleaning Service', rating: '4.8', reviews: '128', price: '120', image: PROVIDER_IMAGES.clean, verified: true, distance: '1.2 km' },
  { id: 'fixmaster', name: 'FixMaster Plumbing', service: 'Plumbing', rating: '4.7', reviews: '96', price: '150', image: PROVIDER_IMAGES.plumbing, verified: true, distance: '2.4 km' },
  { id: 'swiss-electrician', name: 'Swiss Electrician', service: 'Electrical', rating: '4.9', reviews: '68', price: '140', image: PROVIDER_IMAGES.electric, verified: true, distance: '3.1 km' },
  { id: 'colorpro', name: 'ColorPro Painters', service: 'Painting', rating: '4.6', reviews: '74', price: '110', image: PROVIDER_IMAGES.painting, verified: false, distance: '4.8 km' },
];

export const bookings = [
  { id: 'BK-2024-00125', provider: providers[0], service: 'Home Cleaning', date: '24 May 2024', time: '10:00 AM', status: 'Confirmed', location: 'Bahnhofstrasse 123, Zürich', total: '150.00' },
  { id: 'BK-2024-00128', provider: providers[1], service: 'Pipe Installation', date: '28 May 2024', time: '02:00 PM', status: 'Pending', location: 'Kantstrasse 44, Zürich', total: '180.00' },
  { id: 'BK-2024-00131', provider: providers[2], service: 'Light Installation', date: '02 June 2024', time: '11:00 AM', status: 'Confirmed', location: 'Seefeldstrasse 18, Zürich', total: '140.00' },
];

export const conversations = [
  { ...providers[0], message: 'We will arrive on time.', time: '10:30 AM', unread: 2 },
  { ...providers[1], message: 'Thanks! See you then.', time: 'Yesterday', unread: 0 },
  { ...providers[2], message: 'Can you share the details?', time: 'Yesterday', unread: 1 },
  { ...providers[3], message: 'Job completed. Thanks!', time: '2 days ago', unread: 0 },
  { id: 'support', name: 'BlueX Support', service: 'How can we help you?', message: 'How can we help you?', time: '2 days ago', unread: 0, image: undefined },
];
