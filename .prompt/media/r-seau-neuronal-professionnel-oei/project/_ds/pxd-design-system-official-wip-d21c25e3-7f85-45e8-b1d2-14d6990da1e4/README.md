# Pictet PXD Design System

## Is absolutely mandatory that atoms, molecules, organisms and variables used in every prototype design use the exact style each time.

## Sources

- ## **Developer Resources**

  - **Angular**
    - **[NG-Zorro](https://pxd-angular.pictet.aws/library/ng-zorro)**

    - **[PrimeNG](https://pxd-prime-ng.pictet.aws/library/prime-ng)**

    - **[AG Grid](https://pxd-angular.pictet.aws/library/ag-grid)**
  - **React**
    - **[Ant Design](https://pxd-react.pictet.aws/library/ant-design)**
  - **Foundations**
    - **[Base](https://pxd.pictet.aws/library/base)**
    - **[Illustrations](https://pxd.pictet.aws/library/illustrations)**

---

## **Figma Libraries -**

### **This is the golden source where all components has been created originally and has all the correct styling and tokens.**

- **[Atoms & Molecules](https://www.figma.com/design/1nQM3CaBH7q3VbuHlzCZYI/PXD---03---Atoms---Molecules?m=auto)**

- **[Organisms](https://www.figma.com/design/GMhhH0gXou0j8LO4UYD4an/PXD---04---Organisms?m=auto)**

- **[Illustrations](https://www.figma.com/design/pXWgNdXdibBM9DGEA3F9wQ/PXD---06---Illustrations?m=auto)**

## **System Architecture**

PXD follows atomic design. Libraries are ordered dependencies:

```
Foundations (tokens) → Atoms & Molecules (components) → Organisms (sections)
```

- **Foundations** — color tokens, typography scale, spacing, grid, elevation, radius, motion

- **Atoms & Molecules** — buttons, inputs, form fields, dropdowns, badges, pagination, alerts

- **Organisms** — data tables, navigation, modals, forms, page headers, filter panels, cards

- **Illustrations** — standalone assets for empty/error states only

Reference components as `PXD/[Level]/[ComponentName]/[Variant]`. Never use raw hex, px, or font values — always reference tokens.

---

## Components

The following reusable primitives ship compiled in `_ds_bundle.js` (read them off `window.TestPXDDesignSystem_ee5203`):

- **Button** — primary / secondary / text / link, with danger & success tones
- **IconButton** — icon-only action button
- **IconContainer** — plain circular hover slot for one icon glyph
- **Link** — inline text link for navigation inside copy
- **Input** — text field with label, hint and validation states (or a tokenized chips field for multiple values)
- **NumberInput** — bounded numeric field with decrement/increment steppers
- **Select** — dropdown selection field
- **Checkbox** — boolean toggle in a group
- **Radio** — single-choice option in a group
- **Switch** — on/off toggle
- **SegmentedControl** — single-choice pill track (Cash / Equities / Unclassified, Consolidated / Aggregated)
- **Alert** — inline feedback banner (info / success / warning / error)
- **Tag** — static status & category chips with status-tinted tones
- **KPI** — compact card surfacing one key figure (generic value, risk scale, or tag list) with title/subtitle, trend indicator, sparkline, big icon slots, and a swappable main area
- **Chip** — removable filter/selection token (distinct from Tag)
- **Badge** — count / status indicator
- **Tooltip** — small contextual label anchored to a trigger
- **Spinner** — indeterminate loading indicator
- **PopConfirm** — lightweight inline confirmation overlay anchored to a trigger (Yes/No)
- **SplitButton** — primary action fused with a chevron segment that opens a menu of related actions
- **DeltaPill** — status-tinted pill for a directional value (price/perf change)
- **Card** — content surface with optional header and footer actions
- **EditorialCard** — image + topic/date + title/description + author + tags, for articles and content listings
- **Divider** — hairline rule separating sections or inline groups
- **Scrollbar** — decorative custom-scrollbar thumb for static mockups
- **Avatar** / **AvatarGroup** — circular identity token, optional presence status dot (own component family, `components/avatar/`)
- **ListItem** / **ListItemDivider** / **ListItemBasic** — structured list row (media/title/description/actions), list vs. card weight, group-divider row, plain text-only row (own component family, `components/list-item/`)
- **Sidebar** — left-rail navigation organism: square 104×104 items, up to 3 stacked flyout panels, always-present Feedback cell + Pictet brand mark, mobile drawer (`overlay`) with drill-down (own component family, `components/sidebar/`)
- **Drawer** — sliding panel (left/right/top/bottom, sm/md/lg, optional overlay) for secondary tasks without leaving the current view (own component family, `components/drawer/`)
- **Timeline** — vertical dot-and-line list of dated entries; also used for changelogs (own component family, `components/timeline/`)
- **Tour** — single-step spotlight popover with progress dots and Back/Next/Done controls (own component family, `components/tour/`)
- **Transfer** — dual list box; move items between "available" and "selected" one at a time or all at once (own component family, `components/transfer/`)
- **TreeNavigation** — hierarchical expandable/collapsible navigation list (own component family, `components/tree-navigation/`)
- **RichTextEditor** — WYSIWYG editor with a formatting toolbar (bold/italic/underline, lists, quote, align, link, image), `readOnly` mode (own component family, `components/richtexteditor/`)
- **Chart_Container** — chrome for any chart: title with optional sub-header, right-aligned SegmentedControl slot, sized chart area, optional footer (footnote + actions) — no legend (own component family, `components/chart_container/`)
- **Chart_HorizontalBar** — horizontal category comparison; the only PXD chart type supporting negative values (auto centre baseline), independent `showBenchmark` (target-range band + ticks) and `showReference` (black dot) toggles, up to 4 optional data columns (own component family, `components/chart_horizontalbar/`)
- **Chart_Donut** / **Chart_DonutLegend** — part-to-whole donut ring with optional key-metric centre, and its separate color-key + Weight/Amount legend table (own component family, `components/chart_donut/`)
- **EmptyState** / **PageNotFound01Light** — illustration + title/description + primary/secondary action for no-data/no-results/not-found situations, 4 sizes (own component family, `components/emptystate/`)
- **Breadcrumb** — hierarchy trail with a bold-oxblood current page
- **Tab** / **TabList** — underline/side-line tab strip for switching sibling views
- **Accordion** / **AccordionItem** — stack of collapsible disclosure sections
- **Pagination** — windowed numbered page strip with prev/next arrows
- **Table** — sortable / filterable / resizable AG-Grid-style data table with typed cell renderers (text, number, status, imageText, progress, delta)
- **UploadArea** / **UploadItem** / **UploadAvatar** — file dropzone (md/sm), uploaded-file row (default/zebra/error/pill tones, progress), circular avatar photo upload
- **TimePicker** — click-to-open dropdown with scrollable HH/mm/ss columns (NG-Zorro-style interaction), md/lg sizes, default/warning/error states
- **TextArea** — multi-line text input, md/sm sizes, optional character counter, default/success/warning/error states
- **Slider** — draggable/click-to-set track, single value or range, horizontal/vertical orientation
- **Stepper** — sequential progress indicator, horizontal/vertical, dot/md/lg sizes, default/active/completed/error step statuses
- **SearchInput** — text field with leading search glyph + hover-to-reveal clear button, sm/md/lg sizes

## Tokens

Beyond the semantic color/type/spacing tokens in `colors_and_type.css`, the kit's `colors` Figma collection (10/10 variables — categorical chart series) is imported as `--chart-1` … `--chart-10`. Pick a chart color by *position* in that order (never by hue preference) so a series reads consistently across charts.

Naming note: `Button`/`IconButton`/`Alert`/`Badge`/`Chip`/`Radio`/`Select`/`Card` use this system's own singular component vocabulary rather than the source Figma kit's family names (`Buttons`, `🚧Alerts`, `Checkbox` counterpart naming, etc.) — intentional, matching how every other component here is named. `ShilTopbar` ships from a separate, already-existing PXD component package (not this Foundations kit) and is unrelated to its family list.

---
