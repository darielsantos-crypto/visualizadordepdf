interface Props {
  children: React.ReactNode;
}

export default function Footer({ children }: Props) {
  return <footer className="toolbar">{children}</footer>;
}
