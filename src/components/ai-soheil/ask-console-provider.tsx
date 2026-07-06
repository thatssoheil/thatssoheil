"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { AskConsole } from "@/components/ai-soheil/ask-console";
import { CHAT_CLIENT_ENABLED } from "@/lib/ai-soheil/config";

interface AskConsoleContextValue {
	enabled: boolean;
	openAskConsole: (initialPrompt?: string) => void;
}

const AskConsoleContext = createContext<AskConsoleContextValue | null>(null);

export function AskConsoleProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

	const openAskConsole = useCallback((prompt?: string) => {
		if (!CHAT_CLIENT_ENABLED) return;
		setInitialPrompt(prompt?.trim() || null);
		setOpen(true);
	}, []);

	const value = useMemo(
		() => ({ enabled: CHAT_CLIENT_ENABLED, openAskConsole }),
		[openAskConsole],
	);

	return (
		<AskConsoleContext.Provider value={value}>
			{children}
			{CHAT_CLIENT_ENABLED && (
				<AskConsole
					open={open}
					onOpenChange={setOpen}
					initialPrompt={initialPrompt}
					onInitialPromptConsumed={() => setInitialPrompt(null)}
				/>
			)}
		</AskConsoleContext.Provider>
	);
}

export function useAskConsole(): AskConsoleContextValue {
	const value = useContext(AskConsoleContext);
	if (!value) {
		throw new Error("useAskConsole must be used within AskConsoleProvider");
	}
	return value;
}
