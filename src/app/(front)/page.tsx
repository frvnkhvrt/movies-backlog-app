'use client';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-enum-comparison, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */

import Hero from '@/components/hero';
import ShowsContainer from '@/components/shows-container';
import { MediaType, type CategorizedShows, type Show } from '@/types';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import MovieService from '@/services/MovieService';
import { Genre } from '@/enums/genre';
import React from 'react';

export const revalidate = 3600;

const watchlistTitles = [
  'Suzhou River',
  'Kaili Blues',
  'Certified Copy',
  'Werckmeister Harmonies',
  'Mysterious Skin',
  'A Serious Man',
  'Manchester by the Sea',
  'A different Man',
  'A Separation',
  'Under the Silver Lake',
  'Quién te Cantará',
  'The Ghost Writer',
  'Magical Girl',
  'The Wrestler',
  'Wheel of Fortune and Fantasy',
  'Nine Queens',
  'Revanche',
  'Winter Sleep',
  'After Yang',
  'Departures',
  'The Lobster',
  'So Long, My Son',
  'Fallen Leaves',
  'Thirst',
  'Blindspotting',
  'After Yang',
  'Red Rocket',
  'Pain and Glory',
  'Close your Eyes',
  'The Chaser',
  'Upstream Color',
  'Hunger',
  'Irreversible',
  'Red Post on Escher Street',
  'An Elephant Sitting Still',
  'The Worst Person in the World',
  'The Man Without a Past',
  'Pulse',
  'The Aura',
  'First Reformed',
  '2046',
  'Mary and Max',
  'Loveless',
  'Antiporno',
  'The Wind Rises',
  'La La Land',
  'The Killing of a Sacred Deer',
  'Isle of Dogs',
  'The Tale of the Princess Kaguya',
  'I Saw the Devil',
  'Children of men',
  'The Revenant',
  'Holy Motors',
  'The Secret in their Eyes',
  'Dancer in the Dark',
  'Collateral',
  'Leviathan',
  'The Witch',
  'Mother',
  'Enemy',
  'Secret Sunshine',
  'Caché',
  "Long Day's Journey Into Night",
  'Afire',
  'Marriage Story',
  'Three Billboards Outside Ebbing, Missouri',
  'Paterson',
  'Good Time',
  'Under the Skin',
  'Volver',
  'Antichrist',
  'American Psycho',
  'The Pianist',
  'Hanagatami',
  'Whiplash',
  'Before Sunset',
  'Mommy',
  'Portrait of a Lady on Fire',
  'Son of Saul',
  'Burning',
  'Memento',
  'Fantastic Mr. Fox',
  'Climax',
  'Phantom Thread',
  'Inside Llewyn Davis',
  'Adaptation',
  'The Master',
  'The Hunt',
  'The White Ribbon',
  'Memories of Murder',
  'Shame',
  'No Country for Old Men',
  'The Piano Teacher',
  'Love Exposure',
  'Amour',
  'There will be Blood',
  'Yi Yi',
  'Synecdoche, New York',
  'Paris, Texas',
  'Trouble Everyday',
  'Cerrar Los Ojos',
  'Millennium Mambo',
  'Master and Commander',
  'Two Lovers',
  'Volver',
  'The Lost City of Z',
  'Dunkirk',
  'El Sol del Futuro',
  'El Aura',
  'Adaptation',
  'Climax',
  'Casa de Tolerancia',
  'Amour',
  'Silence',
  'First Cow',
  'Election',
  'Infernal Affairs',
];

export default function Index() {
  const h1 = `${siteConfig.name} Home`;
  const [allShows, setAllShows] = React.useState<CategorizedShows[]>([]);
  const [randomShow, setRandomShow] = React.useState<Show | null>(null);
  const [heroIndex, setHeroIndex] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch watchlist movies
        const watchlistPromises = watchlistTitles.map(async (title) => {
          try {
            const searchData = await MovieService.searchMovies(title);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
            const movieResult =
              searchData.results.find(
                (result) =>
                  result.media_type === 'movie' &&
                  (result.title?.toLowerCase() === title.toLowerCase() ||
                    result.original_title?.toLowerCase() ===
                      title.toLowerCase()),
              ) ?? searchData.results[0];

            // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
            if (movieResult && movieResult.media_type === 'movie') {
              // Fetch full movie details to get release date
              const fullMovieData = await MovieService.findMovie(
                movieResult.id,
              );
              const data = fullMovieData.data;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
              data.director =
                (data as any).credits?.crew?.find(
                  (c: any) => c.job === 'Director',
                )?.name ?? '-';
              return data;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            return movieResult || null;
          } catch (error) {
            console.error(`Failed to fetch movie: ${title}`, error);
            return null;
          }
        });
        const watchlistShows = (await Promise.all(watchlistPromises)).filter(
          Boolean,
        ) as Show[];

        const requests: ShowRequest[] = [
          {
            title: 'Trending Now',
            req: {
              requestType: RequestType.TRENDING,
              mediaType: MediaType.ALL,
            },
            visible: true,
          },
          {
            title: 'Netflix TV Shows',
            req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
            visible: true,
          },
          {
            title: 'Popular TV Shows',
            req: {
              requestType: RequestType.TOP_RATED,
              mediaType: MediaType.TV,
              genre: Genre.TV_MOVIE,
            },
            visible: true,
          },
          {
            title: 'Korean Movies',
            req: {
              requestType: RequestType.KOREAN,
              mediaType: MediaType.MOVIE,
              genre: Genre.THRILLER,
            },
            visible: true,
          },
          {
            title: 'Comedy Movies',
            req: {
              requestType: RequestType.GENRE,
              mediaType: MediaType.MOVIE,
              genre: Genre.COMEDY,
            },
            visible: true,
          },
          {
            title: 'Action Movies',
            req: {
              requestType: RequestType.GENRE,
              mediaType: MediaType.MOVIE,
              genre: Genre.ACTION,
            },
            visible: true,
          },
          {
            title: 'Romance Movies',
            req: {
              requestType: RequestType.GENRE,
              mediaType: MediaType.MOVIE,
              genre: Genre.ROMANCE,
            },
            visible: true,
          },
          {
            title: 'Scary Movies',
            req: {
              requestType: RequestType.GENRE,
              mediaType: MediaType.MOVIE,
              genre: Genre.THRILLER,
            },
            visible: true,
          },
        ];
        const shows = await MovieService.getShows(requests);
        const myWatchlist = [
          {
            title: 'My Watchlist',
            shows: watchlistShows,
            visible: true,
            description: 'An app to showcase my personal watchlist with style.',
          },
        ];
        const combinedShows = [...myWatchlist, ...shows];
        setAllShows(combinedShows);

        // Set initial random show from watchlist only
        if (watchlistShows.length > 0) {
          setRandomShow(watchlistShows[0]);
        } else {
          // Fallback: use first show from other categories
          const allMovies = shows.flatMap((s) => s.shows);
          if (allMovies.length > 0) {
            setRandomShow(allMovies[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Set some fallback content
        setAllShows([
          {
            title: 'Error',
            shows: [],
            visible: true,
            description:
              'Failed to load movies. Please check your TMDB API token.',
          },
        ]);
      }
    };
    void fetchData();
  }, []);

  // Change hero every 3 seconds from watchlist only
  React.useEffect(() => {
    if (allShows.length === 0) return;
    const watchlist = allShows.find((s) => s.title === 'My Watchlist');
    if (watchlist && watchlist.shows.length > 0) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % watchlist.shows.length);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setRandomShow(watchlist.shows[heroIndex]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [allShows, heroIndex]);

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <Hero randomShow={randomShow} />
      <ShowsContainer shows={allShows} />
    </>
  );
}

/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-enum-comparison, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */
