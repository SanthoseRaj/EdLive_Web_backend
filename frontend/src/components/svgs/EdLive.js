const EdLiveSvg = ({ className }) => (
  <svg
    viewBox="0 0 320 90"
    preserveAspectRatio="xMinYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <text
      x="0"
      y="48"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="48"
      fontWeight="700"
      dominantBaseline="middle"
    >
      <tspan fill="#2E3192">Ed</tspan>
      <tspan fill="#29ABE2">Live</tspan>
    </text>

    <text
      x="2"
      y="78"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="14"
      fill="#666"
    >
      Your school, your view
    </text>
  </svg>
);

export default EdLiveSvg;
