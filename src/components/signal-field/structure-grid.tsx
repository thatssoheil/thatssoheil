/**
 * A quiet architectural substrate behind the site: content-width rails, a
 * centerline, and sparse horizontal rhythm lines. Pure CSS, decorative, and
 * non-interactive. Mounted once next to SignalField.
 */
export function StructureGrid() {
	return (
		<div className="structure-grid" aria-hidden="true">
			<div className="structure-grid__rails" />
			<div className="structure-grid__rhythm" />
		</div>
	);
}
