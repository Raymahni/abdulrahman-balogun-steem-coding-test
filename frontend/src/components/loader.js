export default function Loader() {
  return (
    <div className="my-1">
      <svg
        width="40"
        height="40"
        viewBox="0 0 50 50"
        style={{ display: "block", margin: "auto" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90"
          strokeDashoffset="60"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            dur="0.8s"
            repeatCount="indefinite"
            from="0 25 25"
            to="360 25 25"
          />
        </circle>
      </svg>
    </div>
  );
}
