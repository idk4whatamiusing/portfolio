const ITEMS = [
  "Selected work",
  "Experiments",
  "Design",
  "Code",
  "Open source",
  "Motion",
];

export default function Marquee() {
  return (
    <div className="marquee" aria-label="Selected work, experiments, design, code, open source, motion">
      <div className="marquee__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div
            className="marquee__group"
            key={copy}
            aria-hidden={copy === 1 ? "true" : undefined}
          >
            {ITEMS.map((item, index) => (
              <span className="marquee__unit" key={`${copy}-${item}`}>
                <span className={index % 2 === 0 ? "marquee__serif" : "marquee__stencil"}>
                  {item}
                </span>
                <span className="marquee__star">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
