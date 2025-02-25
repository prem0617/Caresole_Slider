"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, EffectFade } from "swiper/modules";
import axios from "axios";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import LogoutButton from "./Logout";
import Link from "next/link";
import { UserSession } from "@/app/profile/page";
import { getSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

// Define the data structure
interface CarouselData {
  description: string;
  image_url: string;
  id: number;
}

const FixedCarousel = () => {
  const [carouselData, setCarouselData] = useState<CarouselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSession();
        console.log(sessionData, "Session in Browser");
        setSession(sessionData as UserSession);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const fetchImageData = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get("/api/getImages");
      if (
        response.data?.getAllData &&
        Array.isArray(response.data.getAllData) &&
        response.data.getAllData.length > 0
      ) {
        setCarouselData(response.data.getAllData);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Failed to fetch carousel images:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageData();
  }, []);

  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Featured Gallery
        </h2>

        {loading ? (
          <div className="mx-auto flex gap-5 bg-gray-100 px-4 py-2 rounded-lg font-medium  mb-7 max-w-[200px] justify-center ">
            <Loader2 className="animate-spin"></Loader2>
            <button className="text-muted-foreground">Loading </button>
          </div>
        ) : session && session.user ? (
          <div className="flex justify-center my-6 gap-7">
            <div>
              <LogoutButton />
            </div>
            <div>
              <Link href={"/profile"}>
                <button
                  className="px-4 py-2 rounded-lg font-medium 
        bg-blue-600 text-white"
                >
                  Profile
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-7">
            <Link href={"/auth/signin"}>
              <button className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white">
                Login
              </button>
            </Link>
          </div>
        )}

        <div className="rounded-xl overflow-hidden shadow-xl bg-white">
          {loading ? (
            <div className="w-full h-[500px] bg-gray-100 animate-pulse flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading gallery...</p>
            </div>
          ) : (
            <Swiper
              spaceBetween={30}
              pagination={{
                clickable: true,
              }}
              modules={[Pagination]}
              className="mySwiper shadow-md"
            >
              {carouselData.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="relative h-[500px] overflow-hidden">
                    <img
                      src={slide.image_url}
                      alt={slide.description}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute bottom-0 pb-7
                 bg-white left-0 right-0 bg-opacity-80 p-3"
                    >
                      <p className="text-black">{slide.description}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixedCarousel;
