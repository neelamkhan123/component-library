import type { Meta, StoryObj } from "@storybook/react";
import { Attachment } from "./Attachment";

const meta: Meta<typeof Attachment> = {
  title: "Components/Attachment",
  component: Attachment,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A file or image attached to a message. `type` accepts `"file"` (the default) or `"image"`. Given a `url`, it becomes a real, clickable link. Given `onRemove`, it shows a remove button instead — meant for a file staged in a composer, before it\'s sent.',
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
type Story = StoryObj<typeof Attachment>;

export const File: Story = {
  render: () => (
    <Attachment name="Quarterly-Report.pdf" size="2.4 MB" url="https://example.com/report.pdf" />
  ),
};

export const Image: Story = {
  render: () => (
    <Attachment
      type="image"
      name="Sunset over the bay"
      url="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=300&fit=crop"
    />
  ),
};

export const NoUrlYet: Story = {
  name: "No URL yet (e.g. still uploading)",
  render: () => <Attachment name="vacation-photo.png" size="1.1 MB" />,
};

export const RemovableFile: Story = {
  name: "Removable (staged in a composer)",
  render: () => <Attachment name="Quarterly-Report.pdf" size="2.4 MB" onRemove={() => {}} />,
};

// The picker-style thumbnail row a composer shows for images queued up to
// send — small captioned squares with a remove button, laid out with a
// plain flex row rather than a dedicated wrapper component, the same
// choice already made for stacking `Bubble`s into a conversation.
export const PendingUploads: Story = {
  name: "A row of pending uploads",
  render: () => (
    <div className="flex gap-3">
      <Attachment
        type="image"
        name="workspace.png"
        size="820 KB"
        url="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&h=200&fit=crop"
        onRemove={() => {}}
      />
      <Attachment
        type="image"
        name="desk-reference.jpg"
        size="1.1 MB"
        url="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop"
        onRemove={() => {}}
      />
      <Attachment
        type="image"
        name="office-reference.jpg"
        size="940 KB"
        url="https://images.unsplash.com/photo-1524758631624-e2822e304c37?w=200&h=200&fit=crop"
        onRemove={() => {}}
      />
    </div>
  ),
};
