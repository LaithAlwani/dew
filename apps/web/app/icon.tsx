import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#6D4AA0,#8657C8)",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 15,
            height: 15,
            background: "#ffffff",
            borderRadius: "50% 50% 50% 3px",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
