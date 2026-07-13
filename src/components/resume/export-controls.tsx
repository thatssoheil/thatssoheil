"use client";

import { Download } from "lucide-react";
import styles from "./resume.module.css";

export function ExportControls() {
	return (
		<div className={styles.toolbar} aria-label="Résumé actions">
			<div>
				<p>Application copy</p>
				<span>Choose “Save as PDF” in the native print dialog.</span>
			</div>
			<button type="button" onClick={() => window.print()}>
				<Download aria-hidden="true" size={16} />
				Export PDF
			</button>
		</div>
	);
}
