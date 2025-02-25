"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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
        console.warn("API returned empty data, using fallback images");
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

  const pagination = {
    clickable: true,
    renderBullet: function (index: number, className: any) {
      return '<span class="' + className + '">' + (index + 1) + "</span>";
    },
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm text-center">
          Using demo images. API connection issue detected.
          <button
            onClick={fetchImageData}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      {/* Main Carousel Component */}
      <div className=" flex justify-center mt-32 rounded-lg overflow-hidden">
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
              <div className="relative">
                {loading ? (
                  <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <img
                    src={slide.image_url}
                    alt={slide.description}
                    className="w-full h-[500px] object-cover object-center"
                    onError={(e) => {
                      // Fallback for image loading errors
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/800/400";
                    }}
                  />
                )}
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
      </div>
    </div>
  );
};

export default FixedCarousel;
