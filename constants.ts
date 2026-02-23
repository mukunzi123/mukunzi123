
import { Movie } from './types';

export const GENRES = [
  'Action', 'Adventure', 'Sci-Fi', 'Horror', 'Comedy', 'Drama'
];

export const INITIAL_MOVIES: Movie[] = [
  // Sci-Fi Sector
  {
    id: 's-1',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/zSWdZVtXT7E',
    category: 'Sci-Fi',
    year: 2014,
    fileSize: '2.4 GB',
    popularity: 98,
    quality: '4K',
    status: 'Online'
  },
  {
    id: 's-2',
    title: 'The Matrix',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/vKQi3bBA1y8',
    category: 'Sci-Fi',
    year: 1999,
    fileSize: '1.8 GB',
    popularity: 95,
    quality: 'Full HD',
    status: 'Online'
  },
  {
    id: 's-3',
    title: 'Dune',
    description: 'Feature adaptation of Frank Herbert\'s science fiction novel, about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.',
    posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/n9xhJrPXop4',
    category: 'Sci-Fi',
    year: 2021,
    fileSize: '2.2 GB',
    popularity: 94,
    quality: '4K',
    status: 'Online'
  },
  // Action Sector
  {
    id: 'a-1',
    title: 'John Wick',
    description: 'An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took everything from him.',
    posterUrl: 'https://images.unsplash.com/photo-1611419010196-a360856ff42f?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/2AUmvWm5P2I',
    category: 'Action',
    year: 2014,
    fileSize: '1.6 GB',
    popularity: 96,
    quality: 'Full HD',
    status: 'Online'
  },
  {
    id: 'a-2',
    title: 'Mad Max: Fury Road',
    description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.',
    posterUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/hEJnMQG9ev8',
    category: 'Action',
    year: 2015,
    fileSize: '2.0 GB',
    popularity: 97,
    quality: '4K',
    status: 'Online'
  },
  // Horror Sector
  {
    id: 'h-1',
    title: 'The Conjuring',
    description: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
    posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/k10ETZ41q5o',
    category: 'Horror',
    year: 2013,
    fileSize: '1.4 GB',
    popularity: 92,
    quality: 'Full HD',
    status: 'Online'
  },
  {
    id: 'h-2',
    title: 'A Quiet Place',
    description: 'In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters with ultra-sensitive hearing.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/WR7cc5t7tv8',
    category: 'Horror',
    year: 2018,
    fileSize: '1.3 GB',
    popularity: 91,
    quality: 'Full HD',
    status: 'Online'
  },
  // Comedy Sector
  {
    id: 'c-1',
    title: 'The Mask',
    description: 'Bank clerk Stanley Ipkiss is transformed into a manic superhero when he wears a mysterious mask.',
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/LZl69yk5lEY',
    category: 'Comedy',
    year: 1994,
    fileSize: '1.2 GB',
    popularity: 89,
    quality: 'HD',
    status: 'Online'
  },
  // Drama Sector
  {
    id: 'd-1',
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/6hB3S9bIaco',
    category: 'Drama',
    year: 1994,
    fileSize: '1.9 GB',
    popularity: 99,
    quality: 'Full HD',
    status: 'Online'
  },
  // Adventure Sector
  {
    id: 'adv-1',
    title: 'The Lost World',
    description: 'Explorers find a prehistoric land where dinosaurs still roam.',
    posterUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798ee4?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/f_tYyv7wY9k',
    category: 'Adventure',
    year: 1925,
    fileSize: '1.6 GB',
    popularity: 86,
    quality: 'HD',
    status: 'Online'
  }
];
