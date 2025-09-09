import { sampleMySpaceList } from "./types/mySpaceModel";
import HomeClient from "./HomeClient";

export default function Home() {
  // This is now a Server Component - no "use client" directive
  // We can fetch data server-side here if needed in the future
  return <HomeClient initialSpaces={sampleMySpaceList} />;
}
