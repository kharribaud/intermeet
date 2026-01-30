"use client";

import { useRouter } from "next/navigation";
import { deleteJobPost } from "@/app/actions/job-posts";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
}

export function DeleteJobPostButton({ id }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer cette annonce ?")) return;
    const { error } = await deleteJobPost(id);
    if (error) {
      alert(error);
      return;
    }
    router.push("/annonces");
    router.refresh();
  }

  return (
    <Button type="button" variant="destructive" onClick={handleDelete}>
      Supprimer
    </Button>
  );
}
