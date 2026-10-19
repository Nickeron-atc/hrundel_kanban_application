import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useMoveCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, cardId, targetColumnId }: { boardId: string; cardId: string; targetColumnId: string }) =>
            api.moveCard(boardId, cardId, targetColumnId),
        onMutate: async ({ cardId, targetColumnId }) => {
            await queryClient.cancelQueries({ queryKey: ["boards"] });
            const previousBoards = queryClient.getQueryData(["boards"]);

            queryClient.setQueryData(["boards"], (old: any) => {
                if (!old) return old;
                return old.map((board: any) => ({
                    ...board,
                    columns: board.columns.map((col: any) => {
                        if (col.id === targetColumnId) {
                            const movedCard = findCardInColumns(board.columns, cardId);
                            if (movedCard) {
                                return {
                                    ...col,
                                    cards: [...col.cards, { ...movedCard, columnId: targetColumnId }],
                                };
                            }
                        }
                        return {
                            ...col,
                            cards: col.cards.filter((c: any) => c.id !== cardId),
                        };
                    }),
                }));
            });

            return { previousBoards };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["boards"], context?.previousBoards);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["boards"] });
        },
    });
}

function findCardInColumns(columns: any[], cardId: string) {
    for (const col of columns) {
        const card = col.cards.find((c: any) => c.id === cardId);
        if (card) return card;
    }
    return null;
}
