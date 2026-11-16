# Off-Plan Compare

A decision-support tool for a first-time international investor comparing two or three off-plan properties in Dubai. It puts the offers on the same basis, shows where every number came from, and helps the investor record a decision whose reasons they can explain. The decision stays with the investor.

**Live site: https://ibrahim-alkhateeb.github.io/Off-Plan-Compare/**

The interface is available in English and Arabic (right-to-left), switched from the header.

> All data in the tool is mock and illustrative. Projects and developers are fictional.

## Run it

Requires Node.js 20.19 or later (or 22.12 and later).

```bash
npm install
npm run dev      # start the app, then open the address it prints
npm test         # unit tests for the calculation, alert, summary and wording logic
npm run build    # type-check and build for production
```

The app is designed for desktop, 1280px and wider, and holds together down to 1024px.

## Publishing

Every push to `main` runs the tests, builds the app and publishes it to GitHub Pages through the `gh-pages` branch (`.github/workflows/deploy.yml`). The build uses relative asset paths, so it works at a domain root or under a sub-path.

## Where things live

| What | Where |
|---|---|
| The six properties | `src/data/properties.ts` |
| Area benchmarks (price per sqft, annual rent) | `src/data/benchmarks.ts` |
| Developer delivery records | `src/data/developers.ts` |
| **Every threshold and assumption** (alert thresholds, 4% registration fee, selection limits, display decimals) | `src/config.ts` |
| Formulas | `src/lib/calculations.ts` |
| Alert rules | `src/lib/alerts.ts` |
| Relative advantages, watch points, questions | `src/lib/summary.ts` |
| Number, currency, percentage and quarter formatting | `src/lib/format.ts` |
| Sentences built from figures (alert details, questions, formula explanations) | `src/lib/describe.ts` |
| All interface text | `src/i18n/en.ts`, `src/i18n/ar.ts` |
| Screens | `src/screens/` (Shortlist, Compare, Decide) |
| shadcn/ui primitives | `src/components/ui/` |

In the data, `null` means the agent did not provide the value. It is shown as "Not available – please ask the agent", never as zero, and anything calculated from it is shown the same way.

To change a threshold, edit `src/config.ts`; the alerts, their explanations and the fixed notes all read from it.

## Stack

Vite, React 18, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix), lucide-react, Vitest. No backend, no network calls, no routing, no persistence: all state lives in React and a refresh clears it. Fonts (Inter, IBM Plex Sans Arabic) are bundled, not fetched.

The shadcn components were added with the shadcn CLI. A few were adjusted after generation: `Badge` and `Button` forward refs (needed under React 18 when they act as popover or tooltip triggers), `Table` lets the caller turn off its scrolling wrapper so the header can stick to the page, `ScrollArea` takes an optional horizontal bar, `Progress` fills from the inline start so it mirrors in Arabic, and the `Sonner` toaster no longer depends on a theme provider.

## Decisions where the brief left room

- **Highest / lowest tags.** Shown in sections A to C on price per sqft, the three yields and the service charge per sqft. A row gets no tag if any selected property lacks the value, or if the extreme is shared. Values that display identically count as equal.
- **Relative advantages.** A property gets an advantage only when its own figure is available, at least one other selected property has the figure too, and it is the single extreme. When not every selected property could be compared (a missing value, or a developer with a limited record), the sentence says so: "…among the two with this figure available".
- **Missing values.** Each missing value raises one alert and one question; they are not counted twice.
- **"Points to verify".** The count in the comparison header includes the informational alert for post-handover payments, since it also produces a question for the agent.
- **Alert explanations.** Selecting an inline alert opens the rule and threshold behind it, in the same way a source label opens its explanation. This works by mouse, keyboard and touch.
- **Finding your way in the comparison.** The sticky corner of the table holds a jump index of the six criteria; it shows which one is in view and marks the ones where an alert was raised. The "points to verify" count in each property header opens a list of that property's alerts, and choosing one goes to it in the table. Each criterion starts with a one-line description in plain words.
- **Key figures and all rows.** The comparison opens on the key figures for each criterion. A switch above the table shows all rows, which adds the inputs behind them: price, unit area, area benchmark price, area rent, annual service charge and projects delivered. An input row stays in the key view whenever a selected property has an alert in it, so no alert is ever hidden. Hidden inputs still appear in the formula behind each calculated figure.
- **Compact rows.** In the comparison, the source label sits on the same line as its figure when the column is wide enough and drops beneath it when not. Units are set smaller than numbers. Source labels are borderless there, because dozens sit side by side.
- **On-time delivery rate.** Labelled as a calculated figure; its explanation states that the inputs come from the developer record (mock data). With fewer than three delivered projects the rate is hidden and "Limited project record" is shown with the developer-record label.
- **Payment stages.** The share is labelled as agent data and the amount as a calculated figure, so each number has its own source.
- **Agent's yield.** Shown to two decimals, like the other yields, so the three can be read down a column.
- **Arabic names.** Area names use their Arabic names; the fictional project and developer names are transliterated. Numbers stay in Western digits.
- **Stepper.** A later stage can be reopened from the stepper once it has been reached. Changing the selection starts a new comparison and clears any recorded decision.

## Departure from the original brief

The brief says the tool never ranks, scores or rates a property, and lists property scores as out of scope. At the product owner's request, the Decide stage now shows a rating beside each property name: **Highest rated**, **Average** or **Lowest rated**.

- The rule is in `rateProperties` in `src/lib/summary.ts`: relative advantages listed minus points to verify. When two properties are level, the one with fewer points to verify rates higher. The single top property is "Highest rated", the single bottom one "Lowest rated", and anything else, including a remaining tie, is "Average".
- Both counts are visible on the property's card, the rating opens to show its arithmetic, and the rule is stated once under the cards. It is described as a trial rule and not advice.
- It compares the selected properties with each other only. It says nothing about the wider market.
- The rating appears on the Decide stage only. The comparison table still describes without rating, and the words Buy, Recommended, Best, Winner and score still appear nowhere.

Anyone holding the tool to the brief's acceptance checklist should treat the "never ranks or scores" stance as no longer met on the Decide stage.

## Not done, and limits

- No shadcn MCP server was connected, so components were installed with the shadcn CLI.
- Accessibility was checked by automated contrast measurement and keyboard walk-throughs. It has not been tested with a screen reader.
- The running app was verified in a Chromium-based browser only (Edge). Firefox and Safari were not checked.
- At 1024px and wider the comparison fits without horizontal scrolling, so the sticky criterion column only comes into play on narrower windows, which are outside the supported range.
- Mobile layouts are out of scope by design.
