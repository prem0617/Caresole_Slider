"use client";

import Carousel from "@/components/custom/Carousel";
import { getToken } from "next-auth/jwt";
import { useEffect } from "react";

export default function Home() {
  return (
    <div>
      <Carousel />
    </div>
  );
}
