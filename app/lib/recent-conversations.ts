export type AskTurn = { role: "user" | "assistant"; content: string };

/** The new question plus the two conversations before it. */
export function recentConversations(history: AskTurn[], nextQuestion: string, turns = 2): AskTurn[] {
  const userIndexes = history.flatMap((message, index) => (message.role === "user" ? [index] : []));
  const start = userIndexes.length > turns ? userIndexes[userIndexes.length - turns] : 0;
  return [...history.slice(start), { role: "user", content: nextQuestion }];
}
