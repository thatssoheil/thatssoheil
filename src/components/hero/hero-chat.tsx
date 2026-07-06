"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { useAskConsole } from "@/components/ai-soheil/ask-console-provider";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { surfaceRole } from "@/components/ui/surface";
import { typeRole } from "@/components/ui/typography";
import { STARTERS } from "@/lib/ai-soheil/starters";
import { cn } from "@/lib/utils";

export function HeroChat() {
	const { openAskConsole } = useAskConsole();
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement | null>(null);

	const submit = (text: string) => {
		const content = text.trim();
		if (!content) return;
		setValue("");
		openAskConsole(content);
		inputRef.current?.blur();
	};

	return (
		<div className="mt-9 flex w-full max-w-xl flex-col items-center select-text">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					submit(value);
				}}
				className={cn(
					surfaceRole.heroChatPanel,
					"flex h-[3.25rem] w-full items-center gap-2 px-4",
				)}
			>
				<Input
					ref={inputRef}
					value={value}
					onChange={(event) => setValue(event.target.value)}
					placeholder="ask me anything. no resume here"
					aria-label="Ask Soheil anything"
				/>
				<IconButton
					type="submit"
					variant="send"
					size="sm"
					aria-label="Ask Soheil"
					disabled={!value.trim()}
				>
					<ArrowUp />
				</IconButton>
			</form>

			<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
				{STARTERS.map((starter) => (
					<button
						key={starter}
						type="button"
						onClick={() => submit(starter)}
						className={`rounded-xl border border-alpha-300 px-3.5 py-1.5 text-text-faint transition-colors hover:border-alpha-500 hover:bg-alpha-100 hover:text-foreground ${typeRole.chatStarter}`}
					>
						{starter}
					</button>
				))}
			</div>
		</div>
	);
}
