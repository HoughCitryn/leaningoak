import { ImageResponse } from "next/og";
import { siteConfig } from "@/content/site";

export const alt = "Leaning Oak Ranch wedding and event venue in Bakersfield, California";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(90deg, rgba(34,49,23,.76), rgba(34,49,23,.32)), url(${siteConfig.url}/wp-content/uploads/2017/09/Untitled-design-8.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fffefb",
        padding: "70px",
      }}
    >
      <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: "60px" }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "760px" }}>
          <div style={{ color: "#efeaac", fontSize: "28px", letterSpacing: "4px", textTransform: "uppercase" }}>Bakersfield, California</div>
          <div style={{ marginTop: "20px", fontFamily: "serif", fontSize: "78px", lineHeight: 1.02 }}>Leaning Oak Ranch</div>
          <div style={{ marginTop: "22px", fontSize: "34px" }}>Outdoor Weddings &amp; Events</div>
        </div>
        {/* ImageResponse renders image elements itself. */}
        <img src={`${siteConfig.url}/wp-content/uploads/2017/09/Logo-white-small.png`} width={220} height={240} alt="" />
      </div>
    </div>,
    size,
  );
}
