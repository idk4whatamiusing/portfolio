type SectionLabelProps = {
  children: React.ReactNode;
  tone?: "dark" | "light";
};

export default function SectionLabel({
  children,
  tone = "dark",
}: SectionLabelProps) {
  return (
    <p className={`section-label section-label--${tone}`}>
      <span aria-hidden="true">+++</span>
      <span>{children}</span>
      <span aria-hidden="true">+++</span>
    </p>
  );
}
