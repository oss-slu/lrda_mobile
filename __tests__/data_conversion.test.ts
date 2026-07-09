import DataConversion from "../lib/utils/data_conversion";
import { Note } from "../types";

describe("DataConversion.convertMediaTypes", () => {
  it("converts an API message into a Note with typed media, audio, and string tags", () => {
    const [note] = DataConversion.convertMediaTypes([
      {
        id: "n1",
        title: "Shrine",
        text: "Body",
        time: "2026-07-01T12:00:00.000Z",
        creatorId: "u1",
        latitude: 38.63,
        longitude: -90.23,
        isPublished: true,
        tags: [{ label: "ritual", origin: "user" }, "campus"],
        media: [
          { id: "m1", type: "image", uri: "https://x/img.jpg" },
          { uuid: "m2", type: "video", uri: "https://x/vid.mp4", thumbnailUri: "https://x/thumb.jpg", duration: "12" },
        ],
        audio: [{ id: "a1", type: "audio", uri: "https://x/rec.m4a", duration: "5", name: "rec" }],
      },
    ]);

    expect(note.id).toBe("n1");
    expect(note.time).toEqual(new Date("2026-07-01T12:00:00.000Z"));
    expect(note.tags).toEqual(["ritual", "campus"]);
    expect(note.media).toEqual([
      { uuid: "m1", type: "image", uri: "https://x/img.jpg" },
      { uuid: "m2", type: "video", uri: "https://x/vid.mp4", thumbnail: "https://x/thumb.jpg", duration: "12" },
    ]);
    expect(note.audio).toEqual([{ uuid: "a1", type: "audio", uri: "https://x/rec.m4a", duration: "5", name: "rec", isPlaying: false }]);
  });

  it("falls back to createdAt when time is missing and defaults optional fields", () => {
    const [note] = DataConversion.convertMediaTypes([{ id: "n2", createdAt: "2026-06-15T08:00:00.000Z" }]);

    expect(note.time).toEqual(new Date("2026-06-15T08:00:00.000Z"));
    expect(note.title).toBe("");
    expect(note.text).toBe("");
    expect(note.media).toEqual([]);
    expect(note.audio).toEqual([]);
    expect(note.tags).toEqual([]);
    expect(note.latitude).toBeNull();
    expect(note.longitude).toBeNull();
    expect(note.isPublished).toBe(false);
  });
});

describe("DataConversion.extractImages", () => {
  const baseNote: Omit<Note, "media"> = {
    id: "n1",
    title: "t",
    text: "",
    time: new Date("2026-07-01T12:00:00.000Z"),
    creatorId: "u1",
    audio: [],
    latitude: null as any,
    longitude: null as any,
    isPublished: false,
    tags: [],
  };

  it("uses the uri for images and the thumbnail for videos", () => {
    const notes: Note[] = [
      {
        ...baseNote,
        media: [
          { uuid: "m1", type: "image", uri: "https://x/img.jpg" } as any,
          { uuid: "m2", type: "video", uri: "https://x/vid.mp4", thumbnail: "https://x/thumb.jpg", duration: "12" } as any,
        ],
      },
    ];

    const images = DataConversion.extractImages(notes);

    expect(images.map((i) => i.image)).toEqual(["https://x/img.jpg", "https://x/thumb.jpg"]);
    expect(images[0].note.id).toBe("n1");
  });

  it("returns an empty array for notes without media", () => {
    expect(DataConversion.extractImages([{ ...baseNote, media: [] }])).toEqual([]);
  });
});
