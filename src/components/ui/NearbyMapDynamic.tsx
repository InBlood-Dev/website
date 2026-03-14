"use client";

import dynamic from "next/dynamic";
import Skeleton from "./Skeleton";

const NearbyMap = dynamic(() => import("./NearbyMap"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full h-52 rounded-2xl" variant="rectangular" />
  ),
});

export default NearbyMap;
