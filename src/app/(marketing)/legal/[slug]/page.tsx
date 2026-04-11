import { redirect } from "next/navigation";

export default async function DynamicLegalRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/legal?doc=${slug}`);
}
