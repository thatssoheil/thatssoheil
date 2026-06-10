import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero";
import { ManifestoSection } from "@/components/sections/manifesto";
import { ConnectSection } from "@/components/sections/connect";

export default function Home() {
	return (
		<>
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
		</>
	);
}
