"use client";

import { Download } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import styles from "./resume.module.css";

export function ExportControls() {
	const handleExport = () => {
		const previousTitle = document.title;
		document.title = "soheil-fakour-resume";
		window.print();
		document.title = previousTitle;
	};

	return (
		<Surface
			variant="panel"
			radius="lg"
			className={styles.toolbar}
			aria-label="Résumé actions"
		>
			<div>
				<span>Choose “Save as PDF” and disable “Headers and footers” in the native print dialog.</span>
			</div>
			<button type="button" onClick={handleExport}>
				<Download aria-hidden="true" size={16} />
				Export PDF
			</button>
		</Surface>
	);
}
