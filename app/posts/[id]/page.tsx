import { Post } from "@/app/posts/_components/single-post";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Post id={id.toString()} />;
}
