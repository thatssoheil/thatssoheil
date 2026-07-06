import { AskConsoleProvider } from "@/components/ai-soheil/ask-console-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero";
import { ManifestoSection } from "@/components/sections/manifesto";
import { ConnectSection } from "@/components/sections/connect";

export default function Home() {
	return (
		<AskConsoleProvider>
			<Header />

			<main id="main-content">
				{/* ── Hero ── */}
				<HeroSection />

				{/* ── Manifesto ── */}
				<ManifestoSection />

				{/* ── Connect ── */}
				<ConnectSection />
			</main>

			<Footer />
		</AskConsoleProvider>
	);
}
