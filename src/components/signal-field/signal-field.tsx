/**
 * The living substrate behind the whole site: a fixed, full-viewport field of
 * slow-drifting signal-hued blobs over the void. Pure CSS (see `.signal-field`
 * in globals.css) — no client state, SSR-safe, deterministic. Gives the glass
 * surfaces (P1+) real colour and motion to refract. Decorative: aria-hidden.
 */
export function SignalField() {
	return (
		<div className="signal-field" aria-hidden="true">
			<div className="signal-field__blob signal-field__blob--a" />
			<div className="signal-field__blob signal-field__blob--b" />
			<div className="signal-field__blob signal-field__blob--c" />
		</div>
	);
}
