// Should also have a user relation, but not needed for this demo
export interface MySpaceModel {
  id: string;
  name: string;
  floor: string;
  wall: string;
  favourite: boolean;
  photoId: string;
}

// Example model list with sample data - mutable for demo purposes
export let sampleMySpaceList: MySpaceModel[] = [
  {
    id: "1",
    name: "Living Room",
    floor: "Hardwood",
    wall: "White",
    favourite: false,
    photoId: "a-living-room-filled-with-furniture-and-a-flat-screen-tv-shT_LaGUmYI", // Correct Unsplash photo ID format
  },
  {
    id: "2",
    name: "Bedroom",
    floor: "Hardwood",
    wall: "Grey",
    favourite: false,
    photoId: "white-bed-frame-hCU4fimRW-c", // Correct Unsplash photo ID format
  }
];
