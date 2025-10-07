'use client';

import Hero from '@/components/hero';
import ShowsContainer from '@/components/shows-container';
import { MediaType, type Show } from '@/types';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import MovieService from '@/services/MovieService';
import { Genre } from '@/enums/genre';
import { getRandomShow } from '@/lib/utils';
import { useHeroStore } from '@/stores/hero';
import React from 'react';

export const revalidate = 3600;

export default function Home() {
  const h1 = `${siteConfig.name} Home`;
  const heroStore = useHeroStore();
  const [allShows, setAllShows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const requests: ShowRequest[] = [
        {
          title: 'My Watchlist',
          req: { requestType: RequestType.TRENDING, mediaType: MediaType.ALL },
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
      const randomShow: Show | null = getRandomShow(shows);

      // Tie the hero movie to the first carousel
      if (randomShow && shows[0]?.shows) {
        shows[0].shows = [randomShow, ...shows[0].shows.filter(s => s.id !== randomShow.id)];
      }

      setAllShows(shows);
      if (!heroStore.currentShow) {
        heroStore.setCurrentShow(randomShow);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center">My Watchlist</h2>
      </div>
      <Hero randomShow={heroStore.currentShow} />
      <ShowsContainer shows={allShows} />
    </>
  );
}
