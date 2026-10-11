"use client";

import { DownloadSimple } from "@phosphor-icons/react/ssr";
import { Button, Surface } from "@/components/ui";
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
			layer="elevated"
			className={`${styles.toolbar} rounded-lg shadow-xs ring ring-kumo-line`}
			aria-label="Résumé actions"
		>
			<p className={styles.instructions}>
				Choose “Save as PDF” and disable “Headers and footers” in the native print dialog.
			</p>
			<Button type="button" variant="primary" size="sm" onClick={handleExport}>
				<DownloadSimple aria-hidden="true" weight="regular" />
				Export PDF
			</Button>
		</Surface>
	);
}
