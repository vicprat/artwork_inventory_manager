import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Logger } from '@/utils/logger';
import { Option } from '@/types';

type OptionType = 'artists' | 'techniques' | 'locations' | 'artwork_types';

const fetchOptions = async (type: OptionType): Promise<Option[]> => {
  const res = await fetch(`/api/options/${type}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Failed to fetch ${type}`);
  }
  return res.json();
};

const addOption = async ({ type, name }: { type: OptionType; name: string }): Promise<Option> => {
  const res = await fetch(`/api/options/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Failed to add ${type}`);
  }
  return res.json();
};

export const useOptions = (type: OptionType) => {
  return useQuery<Option[]>({
    queryKey: ['options', type],
    queryFn: () => fetchOptions(type),
    staleTime: 60 * 60 * 1000, // 1 hora
  });
};

export const useAddOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addOption,
    onSuccess: (data, variables) => {
      Logger.success(`'${data.name}' añadido correctamente.`);
      queryClient.invalidateQueries({ queryKey: ['options', variables.type] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      Logger.error(error.message);
    },
  });
};