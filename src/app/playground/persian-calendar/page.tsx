import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { PersianCalendar } from "@/components/playground/persian-calendar";
import { WINDOW_MAX_JY, WINDOW_MIN_JY, tehranToday } from "@/lib/playground/persian-calendar";

// The page renders per request so "today" is the visitor's actual day, never
// baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Persian calendar",
	description:
		"Today in Iran's calendar: the current Shamsi date, a month view you can walk day by day, a countdown to Nowruz, and a two-way Gregorian to Shamsi converter - computed in your browser.",
	alternates: { canonical: "/playground/persian-calendar" },
};

export default function PersianCalendarPage() {
	const today = tehranToday(new Date());

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Persian calendar"
			intro="Iran keeps time by its own calendar: the Shamsi (Solar Hijri) year turns at the March equinox, so its dates drift against the Gregorian calendar by about eleven days a year. Below is where we are in it right now - today's date, the month as a grid you can walk, the countdown to Nowruz, and a two-way converter between the two calendars."
			meta={
				<>
					No data feed - computed in your browser · After Borkowski&apos;s 1996 arithmetic,
					cross-checked against your browser&apos;s own Persian calendar
				</>
			}
		>
			<section aria-label="The calendar">
				<SectionHeading label="The calendar" note="Tehran time, right now" />
				<PersianCalendar initialToday={today} />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						The Shamsi (Solar Hijri) calendar starts its year at 1 Farvardin - the day whose
						March equinox falls before solar noon in Tehran - so the calendar and the sky stay
						in step, and Nowruz lands on 20 or 21 March. This page computes with the
						arithmetic of Kazimierz Borkowski&apos;s 1996 paper, the same method behind the
						widely used{" "}
						<a
							href="https://github.com/jalaali/jalaali-js"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							jalaali-js
						</a>{" "}
						library (MIT): deterministic, dependency-free, identical on the server and in your
						browser.
					</p>
					<p>
						Nothing is fetched at runtime, so nothing here can go stale. Your browser&apos;s
						own Persian calendar - the ICU data behind Intl - is asked for today&apos;s date
						as the page loads, and the two readings are compared on arrival; across the
						supported window they agree on every single day, checked at build time. Rare
						far-future dates can differ from the astronomical determination by a day, and the
						cross-check line says so if it ever happens.
					</p>
					<p>
						The converter covers {WINDOW_MIN_JY} to {WINDOW_MAX_JY} Shamsi - 21 March 1921 to
						20 March 2122 Gregorian - the stretch verified day by day against the
						browser&apos;s calendar. Reference: Borkowski, &quot;The Persian calendar for 3000
						years&quot;, Earth, Moon and Planets 74 (1996); jalaali-js carries the same
						arithmetic under the MIT license.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
