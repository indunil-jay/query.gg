import { IUser } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useGetUser = ({ id }: { id: string | undefined }) =>
  useQuery({
    queryKey: ["author", { id }],
    queryFn: async () => {
      const response = await fetch(`https://dummyjson.com/users/${id}`);
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();

      return data as Promise<IUser>;
    },
    enabled: Boolean(id),
  });
