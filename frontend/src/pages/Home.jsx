import React from "react";
import SearchBar from "../components/SearchBar";
import VideoSection from "../components/VideoSection";
import CategorySlider from "../components/CategorySlider";
import EmergencyBox from "../components/EmergencyBox";
import MapSection from "../components/MapSection";
import AboutSection from "../components/AboutSection";

export default function Home() {
  return (
    <>
      <div style={{ paddingTop: 20 }}>
        <SearchBar />
        <VideoSection />
        <CategorySlider />
        <EmergencyBox />
         <MapSection />
        <AboutSection />
      </div>
    </>
  );
}
