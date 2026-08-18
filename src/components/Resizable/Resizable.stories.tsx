import type { Meta, StoryObj } from "@storybook/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./Resizable";

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A row (or column) of panels that can be resized by dragging the handles between them. Compose it with `ResizablePanel` and `ResizableHandle`, alternating panel/handle/panel as direct children.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

const panelClassName =
  "flex h-40 items-center justify-center bg-white text-sm text-slate-950 dark:bg-slate-950 dark:text-white";

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup className="rounded-lg border border-slate-200 dark:border-slate-800">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className={panelClassName}>Sidebar</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={20}>
        <div className={panelClassName}>Content</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="h-80 rounded-lg border border-slate-200 dark:border-slate-800"
    >
      <ResizablePanel defaultSize={35} minSize={15}>
        <div className={panelClassName}>Header</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={15}>
        <div className={panelClassName}>Body</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  name: "Three panels",
  render: () => (
    <ResizablePanelGroup className="rounded-lg border border-slate-200 dark:border-slate-800">
      <ResizablePanel defaultSize={25} minSize={10}>
        <div className={panelClassName}>Files</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={20}>
        <div className={panelClassName}>Editor</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={10}>
        <div className={panelClassName}>Preview</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const WithoutHandleGrip: Story = {
  name: "Without the handle grip icon",
  render: () => (
    <ResizablePanelGroup className="rounded-lg border border-slate-200 dark:border-slate-800">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className={panelClassName}>Left</div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={20}>
        <div className={panelClassName}>Right</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
