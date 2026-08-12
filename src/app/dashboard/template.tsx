import { PageTransition } from "./_components/PageTransition";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
