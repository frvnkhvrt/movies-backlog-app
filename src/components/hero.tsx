'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getIdFromSlug, getNameFromShow, getSlug, getYear } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { useSearchStore } from '@/stores/search';
import { MediaType, type Show } from '@/types';
import { type AxiosResponse } from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

interface HeroProps {
  randomShow: Show | null;
}

const Hero = ({ randomShow }: HeroProps) => {
  const path = usePathname();

  // stores
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  const handlePopstateEvent = React.useCallback(() => {
    const pathname = window.location.pathname;
    if (!/\d/.test(pathname)) {
      modalStore.reset();
    } else if (/\d/.test(pathname)) {
      const movieId: number = getIdFromSlug(pathname);
      if (!movieId) {
        return;
      }
      const findMovie: Promise<AxiosResponse<Show>> = pathname.includes(
        '/tv-shows',
      )
        ? MovieService.findTvSeries(movieId)
        : MovieService.findMovie(movieId);
      findMovie
        .then((response: AxiosResponse<Show>) => {
          const { data } = response;
          useModalStore.setState({ show: data, open: true, play: true });
        })
        .catch((error) => {
          console.error(`findMovie: `, error);
        });
    }
  }, [modalStore]);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, [handlePopstateEvent]);

  if (searchStore.query.length > 0) {
    return null;
  }

  const handleHref = (): string => {
    if (!randomShow) {
      return '#';
    }
    if (!path.includes('/anime')) {
      const type = randomShow.media_type === MediaType.MOVIE ? 'movie' : 'tv';
      return `/watch/${type}/${randomShow.id}`;
    }
    const prefix: string =
      randomShow?.media_type === MediaType.MOVIE ? 'm' : 't';
    const id = `${prefix}-${randomShow.id}`;
    return `/watch/anime/${id}`;
  };

  return (
    <section aria-label="Hero" className="w-full">
      {randomShow && (
        <>
          <div className="absolute inset-0 z-0 h-[100vw] w-full sm:h-[56.25vw]">
            <motion.div
              key={randomShow?.id}
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="-z-40 h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  randomShow?.backdrop_path ?? randomShow?.poster_path
                    ? `https://image.tmdb.org/t/p/original${
                        randomShow.backdrop_path ?? randomShow.poster_path
                      }`
                    : '/images/grey-thumbnail.jpg'
                })`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 top-0">
              <motion.div
                className="absolute bottom-[35%] left-[4%] top-0 z-10 flex w-[36%] flex-col justify-end space-y-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
                <h1 className="text-[3vw] font-bold">
                  {randomShow?.title ?? randomShow?.name}
                </h1>
                <div className="flex space-x-2 text-[2vw] font-semibold md:text-[1.2vw]">
                  <p>
                    {randomShow?.release_date
                      ? getYear(randomShow.release_date)
                      : randomShow?.first_air_date
                      ? getYear(randomShow.first_air_date)
                      : '-'}
                  </p>
                  {randomShow?.director && <p>• {randomShow.director}</p>}
                </div>
                {/* <p className="line-clamp-4 text-sm text-gray-300 md:text-base"> */}
                <p className="hidden text-[1.2vw] sm:line-clamp-3">
                  {randomShow?.overview ?? '-'}
                </p>
                <div className="mt-[1.5vw] flex items-center space-x-2">
                  <Link prefetch={false} href={handleHref()}>
                    <Button
                      aria-label="Play video"
                      className="h-auto flex-shrink-0 gap-2 rounded-none">
                      <Icons.play className="fill-current" aria-hidden="true" />
                      Play
                    </Button>
                  </Link>
                  <Button
                    aria-label="Open show's details modal"
                    variant="outline"
                    className="h-auto flex-shrink-0 gap-2 rounded-none"
                    onClick={() => {
                      const name = getNameFromShow(randomShow);
                      const path: string =
                        randomShow.media_type === MediaType.TV
                          ? 'tv-shows'
                          : 'movies';
                      window.history.pushState(
                        null,
                        '',
                        `${path}/${getSlug(randomShow.id, name)}`,
                      );
                      useModalStore.setState({
                        show: randomShow,
                        open: true,
                        play: true,
                      });
                    }}>
                    <Icons.info aria-hidden="true" />
                    More Info
                  </Button>
                </div>
              </motion.div>
            </div>{' '}
            <div className="opacity-71 absolute inset-0 right-[26.09%] z-[8] bg-gradient-to-r from-secondary to-85%"></div>
            <div className="absolute bottom-[-1px] left-0 right-0 z-[8] h-[14.7vw] bg-gradient-to-b from-background/0 from-30% via-background/30 via-50% to-background to-80%"></div>
          </div>
          <div className="relative inset-0 -z-50 mb-5 pb-[60%] sm:pb-[40%]"></div>
        </>
      )}
    </section>
  );
};

export default Hero;
