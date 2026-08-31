import type { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A horizontally scrolling set of slides, one shown at a time. Compose it with `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, and (optionally) `CarouselDots`. Built on native CSS scroll-snap, so swipe and trackpad scrolling work for free.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const slideColors = [
  "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-100",
  "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
  "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
  "bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100",
  "bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100",
];

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-sm">
      <CarouselContent>
        {slideColors.map((color, index) => (
          <CarouselItem key={index}>
            <div
              className={`flex h-56 items-center justify-center rounded-xl text-4xl font-semibold ${color}`}
            >
              {index + 1}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const WithDots: Story = {
  render: () => (
    <Carousel className="w-full max-w-sm">
      <CarouselContent>
        {slideColors.map((color, index) => (
          <CarouselItem key={index}>
            <div
              className={`flex h-56 items-center justify-center rounded-xl text-4xl font-semibold ${color}`}
            >
              {index + 1}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  ),
};

export const MultipleVisible: Story = {
  name: "Multiple slides visible",
  render: () => (
    <Carousel className="w-full max-w-md">
      <CarouselContent className="-ml-4">
        {slideColors.map((color, index) => (
          <CarouselItem key={index} className="basis-1/2 pl-4">
            <div
              className={`flex h-40 items-center justify-center rounded-xl text-3xl font-semibold ${color}`}
            >
              {index + 1}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
