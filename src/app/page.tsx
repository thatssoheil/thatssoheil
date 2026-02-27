import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { ExperienceSection } from "@/components/sections/experience";
import { StackSection } from "@/components/sections/stack";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
	return (
		<>
			<Header />

			<main id="main-content">
				{/* ── Hero ── */}
				<HeroSection />

				{/* ── About ── */}
				<AboutSection />

				{/* ── Projects ── */}
				<ProjectsSection />

				{/* ── Experience ── */}
				<ExperienceSection />

				{/* ── Stack ── */}
				<StackSection />

				{/* ── Contact ── */}
				<ContactSection />
			</main>

			<Footer />
		</>
	);
}
