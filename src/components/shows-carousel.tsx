'use client';

import { useModalStore } from '@/stores/modal';
import { MediaType, type Show } from '@/types';
import * as React from 'react';
import { useHeroStore } from '@/stores/hero';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import CustomImage from './custom-image';

interface ShowsCarouselProps {
  title: string;
  shows: Show[];
  description?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  easing?: string;
}

const ShowsCarousel = ({
  title,
  shows,
  description,
  autoplay = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  autoplayDelay: _autoplayDelay = 5000,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  easing: _easing = 'easeInOut',
}: ShowsCarouselProps) => {
  const pathname = usePathname();
  const heroStore = useHeroStore();

  const showsRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  const [isInteracting, setIsInteracting] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // Clone shows for infinite loop
  const duplicatedShows = React.useMemo(() => {
    if (shows.length === 0) return [];
    return [...shows, ...shows];
  }, [shows]);

  // Infinite scroll logic with Framer Motion
  React.useEffect(() => {
    const handleScroll = () => {
      if (!showsRef.current) return;
      const { scrollLeft, scrollWidth, offsetWidth } = showsRef.current;
      const halfWidth = scrollWidth / 2;
      if (scrollLeft >= halfWidth) {
        showsRef.current.scrollLeft = scrollLeft - halfWidth;
      } else if (scrollLeft <= 0) {
        showsRef.current.scrollLeft = halfWidth - offsetWidth;
      }

      // Detect centered movie for watchlist
      if (title === 'My Watchlist' && shows.length > 0) {
        const containerCenter = showsRef.current.offsetWidth / 2;
        const pictures = showsRef.current.querySelectorAll('picture');
        if (pictures.length > 0) {
          let minDistance = Infinity;
          let centeredIndex = 0;
          pictures.forEach((pic, index) => {
            const rect = pic.getBoundingClientRect();
            const containerRect = showsRef.current!.getBoundingClientRect();
            const picCenter = rect.left + rect.width / 2 - containerRect.left;
            const distance = Math.abs(picCenter - containerCenter);
            if (distance < minDistance) {
              minDistance = distance;
              centeredIndex = index;
            }
          });
          const centeredShow = shows[centeredIndex % shows.length];
          if (centeredShow && centeredShow.id !== heroStore.currentShow?.id) {
            heroStore.setCurrentShow(centeredShow);
          }
        }
      }
    };

    const ref = showsRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, [shows, title, heroStore]);

  // Enhanced scroll to direction
  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!showsRef.current) return;

    setIsScrollable(true);
    setIsInteracting(true);

    const scrollAmount = 300; // Moderate distance
    const { scrollLeft } = showsRef.current;
    const newScrollLeft =
      direction === 'left'
        ? scrollLeft - scrollAmount
        : scrollLeft + scrollAmount;

    showsRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });

    // Reset interacting after animation - longer pause for manual navigation
    setTimeout(() => setIsInteracting(false), 3000);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocused) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollToDirection('left');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollToDirection('right');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Constant smooth scroll with pause on interaction
  React.useEffect(() => {
    if (isInteracting || isHovered || isFocused || !autoplay) return;
    let animationId: number;
    const scroll = () => {
      if (!showsRef.current) return;
      showsRef.current.scrollLeft += 0.5; // Slower, smoother scroll
      const { scrollLeft, scrollWidth } = showsRef.current;
      if (scrollLeft >= scrollWidth / 2) {
        showsRef.current.scrollLeft = scrollLeft - scrollWidth / 2;
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, isHovered, isFocused, autoplay]);

  if (shows.length === 0) return null;

  return (
    <section
      aria-label={`Carousel of ${title}`}
      className="relative my-[3vw] animate-fade-in p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="region">
      <div className="space-y-1 sm:space-y-2.5">
        <h2 className="m-0 px-[4%] text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground sm:text-xl 2xl:px-[60px]">
          {title ?? '-'}
        </h2>
        {description && (
          <p className="px-[4%] text-sm text-muted-foreground 2xl:px-[60px]">
            {description}
          </p>
        )}
        <div className="relative w-full items-center justify-center overflow-hidden">
          <Button
            aria-label="Scroll to left"
            variant="ghost"
            className={cn(
              'absolute left-0 top-0 z-10 mr-2 hidden h-full w-[4%] items-center justify-center rounded-l-none bg-transparent py-0 text-transparent hover:bg-secondary/90 hover:text-foreground md:block 2xl:w-[60px]',
              isScrollable ? 'md:block' : 'md:hidden',
            )}
            onClick={() => scrollToDirection('left')}>
            <Icons.chevronLeft className="h-8 w-8" aria-hidden="true" />
          </Button>
          <div
            ref={showsRef}
            className="no-scrollbar m-0 grid transform-gpu auto-cols-[calc(100%/3)] grid-flow-col overflow-x-auto overflow-y-hidden px-[4%] py-0 will-change-transform sm:auto-cols-[25%] md:touch-pan-y lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)] 2xl:px-[60px]">
            {duplicatedShows.map((show, index) => (
              <ShowCard
                key={`${show.id}-${index}`}
                show={show}
                pathname={pathname}
              />
            ))}
          </div>
          <Button
            aria-label="Scroll to right"
            variant="ghost"
            className="absolute right-0 top-0 z-10 m-0 ml-2 hidden h-full w-[4%] items-center justify-center rounded-r-none bg-transparent py-0 text-transparent hover:bg-secondary/70 hover:text-foreground md:block 2xl:w-[60px]"
            onClick={() => scrollToDirection('right')}>
            <Icons.chevronRight className="h-8 w-8" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShowsCarousel;

export const ShowCard = ({ show }: { show: Show; pathname: string }) => {
  const modalStore = useModalStore();

  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  // Get release year for display
  const getReleaseYear = (show: Show): string => {
    const date =
      show.media_type === MediaType.MOVIE
        ? show.release_date
        : show.first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  };

  const releaseYear = getReleaseYear(show);
  const displayTitle = `${getNameFromShow(show)}${
    releaseYear ? ` (${releaseYear})` : ''
  }`;

  return (
    <picture className="relative aspect-[2/3] px-1">
      <a
        className="pointer-events-none"
        aria-hidden={false}
        role="link"
        aria-label={displayTitle}
        href={`/${show.media_type}/${getSlug(show.id, getNameFromShow(show))}`}
      />
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${
                show.poster_path ?? show.backdrop_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={displayTitle}
        className="h-full w-full cursor-pointer filter-none transition-all duration-300 ease-smooth will-change-transform md:hover:scale-105 md:hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] md:hover:blur-[1px] md:hover:filter"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
        style={{
          objectFit: 'cover',
        }}
        onClick={() => {
          const name = getNameFromShow(show);
          const path: string =
            show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
          window.history.pushState(
            null,
            '',
            `${path}/${getSlug(show.id, name)}`,
          );
          modalStore.setState({
            show: show,
            open: true,
            play: true,
          });
        }}
        onError={imageOnErrorHandler}
      />
    </picture>
  );
};
