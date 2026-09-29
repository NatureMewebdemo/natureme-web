import { Suspense } from "react";
import { Explore } from "./Explore";

export const metadata = { title: "Explore · NatureMe" };

export default function ExplorePage() {
  return (
    <Suspense>
      <Explore />
    </Suspense>
  );
}
