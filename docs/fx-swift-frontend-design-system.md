# FX Swift Frontend Design System

## Purpose

This document records the proposed frontend visual direction and reusable component system for FX Swift. It is grounded in the product requirements in [Product Requirement Docs-20260924011943.md](./Product%20Requirement%20Docs-20260924011943.md) and the visual references in [`design-motivation/`](./design-motivation/).

The references guide the design; FX Swift should retain its own identity and should not reproduce another brand's interface.

## Design direction

- **Wise:** practical currency-conversion panels and clear exchange details.
- **Coinbase:** strong information hierarchy and easy-to-scan comparison tables.
- **Jeton:** bold, simple moments that give key sections a distinct visual identity.

The overall experience should feel clear, trustworthy, and action-oriented. Use a calm neutral canvas, white content surfaces, restrained shadows, consistent radii, and generous spacing. Use bright color for primary actions, selected states, and meaningful rate changes.

## Foundations

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| Primary | `#155EEF` | Primary actions, links, selected controls, active chart line |
| Primary dark | `#0B1F3A` | Header, navigation, high-emphasis surfaces |
| Page background | `#F8FAFC` | Main page canvas |
| Surface | `#FFFFFF` | Cards, forms, tables |
| Text | `#0F172A` | Headings, key values, primary copy |
| Supporting text | `#64748B` | Descriptions, labels, metadata |
| Border | `#E2E8F0` | Card edges, dividers, control outlines |
| Positive | `#16A34A` | Known positive movement and success feedback |
| Negative | `#DC2626` | Known negative movement and errors |
| Warning | `#F59E0B` | Stale rates and warnings |

Do not infer positive or negative movement when the direction is unknown. Status must be communicated with text or an icon as well as color.

### Typography

Use the supplied local Boing font for display headings and prominent section titles. The project contains these weights under `public/fonts/`: Thin, Light, Regular, Medium, Semibold, Bold, and Semibold Italic. Use Inter for body copy, form labels, metadata, tables, and controls, with a system sans-serif fallback. Keep numeric values legible and aligned consistently, especially in rate comparisons and conversion fields.

### Shape, spacing, and elevation

- Use smaller, consistent corner radii for controls and badges and larger radii for cards and major panels.
- Use a consistent spacing scale and generous separation between major sections.
- Prefer subtle borders to heavy outlines and keep shadows restrained.
- Reserve large or saturated color areas for clear hierarchy or section emphasis.

## Component system by page section

| Section | Components | Design and behavior |
| --- | --- | --- |
| Header and navigation | `SiteHeader`, `Brand`, `PrimaryNav`, `NavAction`, `MobileMenu` | Compact navy header with FX Swift wordmark, clear active-link state, primary navigation, and a prominent action. Collapse navigation accessibly on small screens. |
| Converter hero | `HeroSection`, `CurrencyConverter`, `CurrencyInput`, `CurrencySelect`, `SwapButton`, `RateSummary`, `PrimaryButton` | Prominent conversion panel on a light background. Keep the selected pair visible and include source/target amounts, currency selection, swap action, rate, provider/freshness metadata where available, and a clear CTA. |
| Current rate | `CurrentRateCard`, `RateChange`, `FreshnessLabel` | Make the current rate the strongest element. Identify its pair and provider, show freshness, and show movement only when known. |
| Provider comparison | `ComparisonSection`, `ProviderTable`, `ProviderRow`, `ProviderIdentity`, `FeeDetail`, `BestRateBadge` | Use consistent provider rows with rate, fee or transfer detail, and amount received. Use a table on wide screens and stacked provider cards on mobile. Only show a best-rate badge when available data justifies it. |
| 24-hour trend | `TrendCard`, `PeriodLabel`, `RangeControl`, `Chart` | Label the pair and 24-hour period; show current value and change. Provide loading, empty, and stale-data states. Use blue for the line and restrained status colors for direction. |
| Rate alerts | `AlertSection`, `AlertForm`, `PairSelect`, `TargetRateField`, `RangeField`, `TriggerMode`, `ChannelSelect`, `AlertCard` | Let users configure a pair, target and tolerance range or threshold, and WhatsApp or Telegram. Active alert cards show pair, condition, channel, status, edit, enable/disable, and delete actions. |
| Alert feedback | `StatusBanner`, `InlineFeedback`, `Skeleton`, `EmptyState` | Use concise success, warning, and error messages. Pair status color with text and an icon; provide an action when useful. |
| Supporting content | `SectionHeader`, `InfoCard`, `TrustDetails`, `FAQItem` | Use calm section headings and concise explanatory content. Keep secondary information visually subordinate to conversion and comparison. |
| Footer | `Footer`, `FooterGroup`, `SupportLink`, `LegalLinks` | Keep support, product, and legal links grouped and easy to scan. Use a dark navy or light neutral treatment that remains secondary to the main task. |

## Shared component variants

- `Button`: primary, secondary, subtle, destructive, and disabled.
- `TextField` and `Select`: default, focused, invalid, disabled, and read-only where relevant.
- `CurrencyInput`: amount input paired with a currency selector and clear currency context.
- `Badge`: neutral, positive, negative, warning, and best-rate variants.
- `Card`: standard content card, emphasized rate card, and interactive/selectable card.
- `SectionHeader`: eyebrow/label, heading, supporting copy, and optional action.
- `ProviderRow`: provider identity, rate, fee/delivery detail, received amount, and optional best-rate status.
- `RateChange`: value plus explicit direction label/icon; omit direction when not known.
- `Chart`: accessible pair/period description plus loading, empty, and stale states.
- `AlertForm` and `AlertCard`: configuration and management patterns described above.
- `StatusBanner`, `Skeleton`, and `EmptyState`: shared feedback and data-availability patterns.

## Product behavior represented in the frontend

The component system should support these product requirements:

1. Users can select source and target currencies and see the selected pair clearly.
2. Current rates identify their provider and show a timestamp or freshness indicator where available.
3. Provider comparisons use a consistent format and identify top rates only when the data supports it.
4. The initial trend view covers the previous 24 hours and labels the period.
5. An alert supports a target and range/tolerance or a reaches/exceeds threshold condition.
6. Users can choose WhatsApp or Telegram and manage an alert by editing, enabling/disabling, or deleting it.
7. An alert state clearly shows its pair, condition, channel, and status.
8. A triggered notification is intended to include the top three available provider rates, with the best available rate highlighted where appropriate.

Notification delivery requires users to explicitly connect/authorize a channel. Delivery success and failure need clear feedback. Trigger evaluation and repeated-notification suppression are product/system behaviors; a visual frontend alone does not implement them.

## Responsive behavior

- Keep the converter usable without horizontal scrolling on narrow screens; stack amount controls as needed while keeping the swap action easy to reach.
- Convert provider comparison columns into stacked provider cards on small screens while preserving rate, fees, and amount received.
- Stack alert setup and active alerts on mobile; keep each condition and management action visible.
- Maintain readable chart labels and controls on smaller viewports.
- Keep the mobile navigation accessible by keyboard and screen readers, with a visible expanded/collapsed state.

## Accessibility and content rules

- Give every input and control a visible or programmatic label.
- Preserve visible keyboard focus and use semantic buttons, links, headings, and form elements.
- Do not rely on color alone for movement, warnings, or alert status.
- Format currencies and rates consistently and identify the unit (for example, NGN per GBP).
- Show freshness and data availability clearly; do not present illustrative or stale values as live data.
- Use concise copy and avoid dense promotional text in core conversion and comparison flows.

## Frontend implementation scope

This document defines the design direction and component responsibilities. The first frontend pass can use representative data to establish layout, responsive behavior, and interaction states. Live exchange-rate sources, alert evaluation, account connection, and WhatsApp/Telegram delivery require separate integration work and should not be implied by a visual prototype.
