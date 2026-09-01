"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "neelam-ui";

const slides = ["One", "Two", "Three", "Four", "Five"];

export default function CarouselDemo() {
  return (
    <div className="w-full max-w-sm">
      <Carousel aria-label="Featured items">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-2xl font-semibold text-slate-950 dark:bg-slate-800 dark:text-white">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        {/* Must live inside <Carousel> — it reads the current slide from context. */}
        <CarouselDots />
      </Carousel>
    </div>
  );
}
