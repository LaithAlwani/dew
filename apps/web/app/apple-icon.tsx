import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            background: "#ffffff",
            borderRadius: "50% 50% 50% 14px",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
