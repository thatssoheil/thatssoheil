/**
 * The SVG filter behind the one "wow" moment: when the chat takeover opens in a
 * Chromium engine, `.glass-refract` points `backdrop-filter` at this filter, which
 * blurs the live backdrop (the signal field) and then warps it with fractal-noise
 * displacement — real edge-lensing refraction, not flat frost. Rendered only when
 * refraction is active (see useRefractionSupported); inert markup otherwise.
 */
export function SignalGlassFilter() {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			style={{ position: "absolute", width: 0, height: 0 }}
		>
			<filter
				id="signal-glass-refract"
				x="-20%"
				y="-20%"
				width="140%"
				height="140%"
				colorInterpolationFilters="sRGB"
			>
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.008 0.013"
					numOctaves={2}
					seed={7}
					result="noise"
				/>
				<feGaussianBlur in="SourceGraphic" stdDeviation={8} result="blurred" />
				<feDisplacementMap
					in="blurred"
					in2="noise"
					scale={26}
					xChannelSelector="R"
					yChannelSelector="G"
					result="displaced"
				/>
				<feColorMatrix in="displaced" type="saturate" values="1.5" />
			</filter>
		</svg>
	);
}
