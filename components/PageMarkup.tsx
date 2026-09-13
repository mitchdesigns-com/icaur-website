type Props = {
  html: string;
};

export function PageMarkup({ html }: Props) {
  return (
    <div
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
