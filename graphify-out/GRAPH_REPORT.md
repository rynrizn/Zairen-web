# Graph Report - Zairen-web  (2026-10-18)

## Corpus Check
- 140 files · ~193,574 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 5, .toml 4, .css 2)

## Summary
- 1604 nodes · 3490 edges · 103 communities (93 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `419869ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.ts
- package.json
- login.astro
- sonner
- CarritoDrawer.tsx
- react
- ProductoEditor.tsx
- supabase.ts
- database.ts
- dependencies
- compilerOptions
- PedidosTable.tsx
- Zairen Brand Asset Logo (Negativo)
- pnpm Workspace Build Config
- Git Development Flow & PRs
- env.d.ts
- el
- live-browser.js
- modern-screenshot.umd.js
- initGlobalBar
- connectSSE
- renderDesignVisual
- Task List: Zairen Lab // Rediseño Zen, Modo Claro/Oscuro, Mejoras Admin y Métricas
- resumeSession
- adapt.md
- new-work.md
- documentRefForElement
- onboard.md
- $impeccable hooks
- refreshParamsPanel
- handleManualEditActivity
- createLiveBrowserDomHelpers
- The Toolkit
- captureElementToBlob
- initPageChat
- actOnAgentTarget
- Fases del Plan
- injectVariantsFromSource
- createLiveBrowserSessionState
- focusSteerChat
- ConfiguracionWeb.tsx
- Responsive Design
- animate.md
- live.md
- Handle `generate`
- injectSvelteComponentsFromManifest
- Generate Report
- New visual work
- optimize.md
- Impeccable Asset Producer
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- startVoice
- Task List by Phases
- startVariantObserver
- critique.md
- Simplify the Design
- Hardening Dimensions
- Extract Flow
- clarify.md
- Nielsen's 10 Heuristics
- Generate Combined Critique Report
- document.md
- polish.md
- quieter.md
- scheduleAcceptCleanup
- Init flow
- syncEditBadgeHitProxies
- Common Cognitive Load Violations
- iOS platform
- Operate mode depth (and Read notes)
- Impeccable Documenter
- adapt.native.md
- Android platform
- colorize.md
- Persona-Based Design Testing
- enableInlineEdit
- SKILL.md
- Shape
- Badge.tsx
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- Diagnostic Scan
- Visualize: Direction Comps & Asset Production
- scripts
- astro.config.mjs
- PrerenderWebSocket
- Region map
- Constraints // ZAIREN LAB
- devDependencies
- Heuristics Scoring Guide
- Operate
- Read
- Agent Instructions // ZAIREN LAB
- Zairen Brand Asset Logo (Oficial)
- bolder.md
- resolveLiveInjectionAnchor
- Persuade and Experience

## God Nodes (most connected - your core abstractions)
1. `react` - 35 edges
2. `connectSSE()` - 34 edges
3. `setLiveState()` - 33 edges
4. `resumeSession()` - 33 edges
5. `showToast()` - 31 edges
6. `siteConfig` - 31 edges
7. `initGlobalBar()` - 30 edges
8. `el()` - 29 edges
9. `buildInsertConfigureRow()` - 27 edges
10. `handleKeyDown()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Fase 3: Carrito — No abrir automáticamente al agregar` --references--> `addItem()`  [INFERRED]
  docs/plan-produccion-real.md → src/stores/cartStore.ts
- `✅ Fase 3: Carrito — Guardado silencioso sin auto-apertura` --references--> `addItem()`  [INFERRED]
  PRODUCCION.md → src/stores/cartStore.ts
- `Overview` --references--> `ConfiguracionWeb()`  [INFERRED]
  tasks/plan.md → src/components/admin/settings/ConfiguracionWeb.tsx
- `Overview` --references--> `CarritoDrawer()`  [INFERRED]
  tasks/plan.md → src/components/catalogo/CarritoDrawer.tsx
- `Overview` --references--> `DetalleProducto()`  [INFERRED]
  tasks/plan.md → src/components/catalogo/DetalleProducto.tsx

## Import Cycles
- None detected.

## Communities (103 total, 10 thin omitted)

### Community 0 - "site.ts"
Cohesion: 0.07
Nodes (25): Site Configuration Guide, AdminSidebar(), AdminSidebarProps, CartItem, POSProduct, POSTerminal(), SaleRecord, bar (+17 more)

### Community 1 - "package.json"
Cohesion: 0.12
Nodes (15): description, engines, node, name, type, version, lucide-react, nanostores (+7 more)

### Community 2 - "login.astro"
Cohesion: 0.12
Nodes (13): Zairen Lab Tokyo Experimental Apparel, Toaster(), canonicalURL, Props, theme, errorBox, eyeOffIcon, eyeOpenIcon (+5 more)

### Community 3 - "sonner"
Cohesion: 0.18
Nodes (18): sonner, CatalogoGrid(), CatalogoGridProps, DetalleProducto(), DetalleProductoProps, ShareProductModal(), ShareProductModalProps, TarjetaPolera() (+10 more)

### Community 4 - "CarritoDrawer.tsx"
Cohesion: 0.25
Nodes (15): CarritoDrawer(), TurnstileWidget(), TurnstileWidgetProps, Window, CartItem, clearCart(), closeDrawer(), getCartShippingCost() (+7 more)

### Community 5 - "react"
Cohesion: 0.12
Nodes (19): @nanostores/react, react, BottomNavMobile(), CartBadge(), mobileMenu, Props, toggleBtn, ShareButton() (+11 more)

### Community 6 - "ProductoEditor.tsx"
Cohesion: 0.18
Nodes (13): InventarioManager(), InventarioTableProps, MatrizStock(), MatrizStockProps, SIZES, StockBySize, InventarioItem, ProductoEditor() (+5 more)

### Community 7 - "supabase.ts"
Cohesion: 0.08
Nodes (20): ClienteRecord, ClientesTable(), AlertasInventario(), AlertItem, CollectionStat, DonutColecciones(), PALETTE, PedidosPendientes() (+12 more)

### Community 8 - "database.ts"
Cohesion: 0.12
Nodes (15): AtributoProducto, Cliente, Coleccion, Configuracion, DetallePedido, EstadoComercial, Imagen, Inventario (+7 more)

### Community 9 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, astro, @astrojs/cloudflare, @astrojs/react, clsx, lucide-react, nanostores, @nanostores/react (+7 more)

### Community 10 - "compilerOptions"
Cohesion: 0.18
Nodes (10): astro/tsconfigs/strict, compilerOptions, allowJs, baseUrl, jsx, jsxImportSource, paths, strictNullChecks (+2 more)

### Community 11 - "PedidosTable.tsx"
Cohesion: 0.32
Nodes (7): mapDbStatusToUi(), mapUiStatusToDb(), Order, OrderItem, OrderStatus, PedidosTable(), loadOrders()

### Community 16 - "el"
Cohesion: 0.08
Nodes (47): actionLabel(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow(), buildConfigureSubmitButton() (+39 more)

### Community 17 - "live-browser.js"
Cohesion: 0.04
Nodes (76): applyGlobalBarLabelState(), applyLiveBarPreference(), applyPlaceholderSizingStyles(), bufferToBase64(), buildInsertPlaceholderSnapshotFromDom(), buildLocatorForLeaf(), buildPickedAnchorSnapshot(), buildSavingRow() (+68 more)

### Community 18 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 19 - "initGlobalBar"
Cohesion: 0.10
Nodes (33): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), buildDesignHeader(), designPanelCss(), detectPageTheme(), ensureAgentPollTooltip() (+25 more)

### Community 20 - "connectSSE"
Cohesion: 0.06
Nodes (104): abandonForeignSession(), abandonSupersededGo(), abortSvelteComponentInjection(), applyConfigureBarChrome(), applyEditing(), beginEditPin(), beginNewLiveConfiguration(), buildCyclingRow() (+96 more)

### Community 21 - "renderDesignVisual"
Cohesion: 0.08
Nodes (36): buildCollapsible(), buildColorModels(), buildListHtml(), buildRadiiModels(), buildTypographyModels(), copyToClipboard(), cssSafe(), designEmptyMessage() (+28 more)

### Community 22 - "Task List: Zairen Lab // Rediseño Zen, Modo Claro/Oscuro, Mejoras Admin y Métricas"
Cohesion: 0.06
Nodes (35): Checkpoint 1: Catálogo Zen y Navegación, Checkpoint 2: Atmósfera Zen y Modo Claro Impecable, Checkpoint 3: Footer Limpio y Equilibrado, Checkpoint 4: Admin Optimizado y Consistente, Checkpoint 5: Módulo de Métricas Independiente, Phase 1: Catálogo Zen — Header, Secciones Colapsables, Scrollbar y Filtros Ampliados, Phase 2: Sistema de Fondos Zen, Modo Claro/Oscuro y Contrastes Globales, Phase 3: Rediseño y Limpieza del Footer (+27 more)

### Community 23 - "resumeSession"
Cohesion: 0.17
Nodes (19): applySavedSessionMeta(), clampVariantIndex(), clearHandled(), findActiveSessionSummary(), findAdoptableServerSession(), findAnyVariantsWrapper(), findInsertAnchorInDom(), isSessionHandled() (+11 more)

### Community 24 - "adapt.md"
Cohesion: 0.12
Nodes (15): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+7 more)

### Community 25 - "new-work.md"
Cohesion: 0.13
Nodes (14): Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments, Verify, Visitor mode (+6 more)

### Community 26 - "documentRefForElement"
Cohesion: 0.08
Nodes (32): addManualContextText(), canRestoreManualEditElement(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext(), copyEditLeafContext(), cssIdent() (+24 more)

### Community 27 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 28 - "$impeccable hooks"
Cohesion: 0.33
Nodes (6): Constraints, Failure modes, Flow, $impeccable hooks, Routing, Triage findings

### Community 29 - "refreshParamsPanel"
Cohesion: 0.17
Nodes (19): applyParamDefaults(), applyParamValue(), buildParamsPanel(), closedClipPath(), completeParameterPublication(), formatRangeValue(), getVisibleVariantEl(), hideParamsPanel() (+11 more)

### Community 30 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 31 - "createLiveBrowserDomHelpers"
Cohesion: 0.14
Nodes (16): createLiveBrowserDomHelpers(), cloneWithoutChrome(), cssId(), liveUiRoot(), makeFrozenAnchor(), own(), pickable(), raiseHitModal() (+8 more)

### Community 32 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 33 - "captureElementToBlob"
Cohesion: 0.11
Nodes (22): averageRgb01(), buildAnnotationsForCapture(), buildPinElement(), captureChromeNodes(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01() (+14 more)

### Community 34 - "initPageChat"
Cohesion: 0.16
Nodes (27): armPageChatForTyping(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), collapsePageChat(), expandPageChat(), focusPageChatInput(), initPageChat() (+19 more)

### Community 35 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 36 - "Fases del Plan"
Cohesion: 0.07
Nodes (25): Estrategia de Branches y PR, Fase 1: Cloudflare Turnstile Real (Carrito + Login Admin), Fase 2: Logos Cloudinary (Reemplazar recursos locales), Fase 3: Carrito — No abrir automáticamente al agregar, Fase 4: Splash Loader — Quitar texto, solo imagen, Fase 5: Configuraciones Admin persistentes en Supabase, Fase 6: Productos desde Supabase (eliminar mocks), Fase 7: Admin Light Mode — Corrección visual (+17 more)

### Community 37 - "injectVariantsFromSource"
Cohesion: 0.43
Nodes (7): injectVariantsFromSource(), isFrameworkComponentPreviewMode(), isJsxSourceFile(), isSvelteComponentManifestPath(), normalizeSessionPath(), recoverMissedGenerationCompletion(), rememberSessionFileMeta()

### Community 38 - "createLiveBrowserSessionState"
Cohesion: 0.22
Nodes (15): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+7 more)

### Community 39 - "focusSteerChat"
Cohesion: 0.20
Nodes (16): attachSteerFocusDebug(), attachSteerFocusGuard(), clearSteerFocusRecoverTimer(), focusConfigureInput(), focusSteerChat(), isInlineEditActive(), isPageEditableActive(), isPageEditableElement() (+8 more)

### Community 40 - "ConfiguracionWeb.tsx"
Cohesion: 0.20
Nodes (11): ConfiguracionWeb(), loadConfig(), defaultSucursales, Sucursal, CurrencyConfig, getCurrencyConfig(), setCurrencyConfig(), SocialNetwork (+3 more)

### Community 41 - "Responsive Design"
Cohesion: 0.20
Nodes (10): Breakpoints: Content-Driven, Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch (+2 more)

### Community 42 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 43 - "live.md"
Cohesion: 0.07
Nodes (26): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, Cleanup, Exit, First-time setup, Handle `accept` (+18 more)

### Community 44 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 45 - "injectSvelteComponentsFromManifest"
Cohesion: 0.17
Nodes (19): applyOriginalAttrsToSvelteAnchor(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase(), findLiveElementForSvelteManifest(), getMountedSvelteComponentAnchor(), importFirstReachable() (+11 more)

### Community 46 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 47 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 48 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.15
Nodes (11): Act on the receipt, Assemble and review, Plan and asset review, Plan, capture, serve, Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract (+3 more)

### Community 50 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.15
Nodes (13): Component translation rules, Narrative mapping, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Step 1: Find the design assets, Step 2: Auto-extract what can be auto-extracted, Step 2b: Stage the frontmatter, Step 3: Ask the user for qualitative language (+5 more)

### Community 51 - "startVoice"
Cohesion: 0.33
Nodes (9): finishVoiceSession(), isEmbeddedPreviewBrowser(), releaseVoiceEngine(), startVoice(), steerSpeechRecognitionCtor(), steerVoiceErrorMessage(), steerVoiceUnavailableMessage(), syncConfigureInputChrome() (+1 more)

### Community 52 - "Task List by Phases"
Cohesion: 0.12
Nodes (14): topProducts, TopVendidos(), dataSets, VentasChart(), Architecture & Design Decisions, Implementation Plan: Rediseño Zen Catálogo, Modo Claro/Oscuro, Mejoras Admin y Métricas Independientes, Overview, Phase 1: Catálogo Zen — Header, Secciones Colapsables, Scrollbar y Filtros Ampliados (+6 more)

### Community 53 - "startVariantObserver"
Cohesion: 0.18
Nodes (24): applyPlaceholderDimensions(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady(), completeSourceInjection(), ensureInsertPlaceholder(), finalizeInsertSession(), findVariantsWrapper(), isInsertGeneratingSession() (+16 more)

### Community 54 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 55 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 56 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 57 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 58 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 59 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 60 - "Generate Combined Critique Report"
Cohesion: 0.18
Nodes (11): Design Health Score, Design Specificity Verdict, Generate Combined Critique Report, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+3 more)

### Community 61 - "document.md"
Cohesion: 0.18
Nodes (10): Pitfalls, Seed mode, Step 1: Route through new-work's workshop, Step 2: Write seed DESIGN.md, Step 3: Confirm, Style guidelines, The frontmatter: token schema, The markdown body: eight sections (canonical order) (+2 more)

### Community 62 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 63 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 64 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 65 - "Init flow"
Cohesion: 0.20
Nodes (10): Completion gate, Init flow, Step 1: Load current state, Step 2: Explore the project, Step 3: Interview for product truth, Step 4: Write PRODUCT.md, Step 5: Record workflow defaults, Step 6: Wrap up or resume (+2 more)

### Community 66 - "syncEditBadgeHitProxies"
Cohesion: 0.27
Nodes (10): bindEditBadgeProxy(), editBadgeProxyTargets(), initEditBadge(), initEditBadgeHitProxies(), positionEditBadge(), proxyMouseEvent(), setImportantStyle(), styleEditBadgeProxy() (+2 more)

### Community 67 - "Common Cognitive Load Violations"
Cohesion: 0.22
Nodes (9): 1. The Wall of Options, 2. The Memory Bridge, 3. The Hidden Navigation, 4. The Jargon Barrier, 5. The Visual Noise Floor, 6. The Inconsistent Pattern, 7. The Multi-Task Demand, 8. The Context Switch (+1 more)

### Community 68 - "iOS platform"
Cohesion: 0.22
Nodes (9): Color & materials, Components & controls, iOS platform, Layout & structure, Motion, The iOS slop test, Touch targets, Typography (+1 more)

### Community 69 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 70 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 71 - "adapt.native.md"
Cohesion: 0.25
Nodes (7): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 72 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 73 - "colorize.md"
Cohesion: 0.25
Nodes (7): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode

### Community 74 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 75 - "enableInlineEdit"
Cohesion: 0.40
Nodes (5): collectEditableTextRows(), visit(), enableInlineEdit(), onInlineInput(), wrapMixedContentTextNodes()

### Community 76 - "SKILL.md"
Cohesion: 0.09
Nodes (17): Craft floor, Refuse, Verify, Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding (+9 more)

### Community 77 - "Shape"
Cohesion: 0.25
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 78 - "Badge.tsx"
Cohesion: 0.29
Nodes (5): clsx, tailwind-merge, BadgeProps, Button, ButtonProps

### Community 79 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 80 - "Cognitive Load Assessment"
Cohesion: 0.29
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 81 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 82 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 83 - "live-browser-ignores.js"
Cohesion: 0.52
Nodes (6): globToRegex(), matchesScope(), normalizeIgnoreRule(), normalizeIgnoreValue(), pageCandidates(), resolveDetectIgnores()

### Community 84 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 86 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 88 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, check, dev, preview, start

### Community 89 - "astro.config.mjs"
Cohesion: 0.25
Nodes (5): astro, @astrojs/cloudflare, @astrojs/react, @tailwindcss/vite, prerender

### Community 91 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 92 - "Constraints // ZAIREN LAB"
Cohesion: 0.40
Nodes (4): Constraints // ZAIREN LAB, Floor (Siempre en vigor), Reglas de Marca y Arquitectura Específicas, Verificación de Código

### Community 93 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @types/node, @types/react, @types/react-dom, typescript

### Community 94 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 95 - "Operate"
Cohesion: 0.50
Nodes (3): Comps, Directions, Operate

### Community 96 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

### Community 101 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 102 - "resolveLiveInjectionAnchor"
Cohesion: 0.31
Nodes (11): checkpointPayload(), elementMatchesOriginalMarkup(), findLiveElementForOriginalMarkup(), findLiveElementFromAnchorSnapshot(), isUsableInjectionAnchor(), normalizeElementClassName(), parseOriginalMarkupElement(), queueCheckpoint() (+3 more)

### Community 105 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

## Knowledge Gaps
- **594 isolated node(s):** `name`, `type`, `version`, `description`, `dev` (+589 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 647 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `connectSSE` to `Init flow`, `syncEditBadgeHitProxies`, `focusSteerChat`, `live.md`, `SKILL.md`, `live-browser.js`, `initGlobalBar`, `resumeSession`, `handleManualEditActivity`?**
  _High betweenness centrality (0.258) - this node is a cross-community bridge._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _594 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Why does `Commands` connect `SKILL.md` to `connectSSE`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `Init flow` connect `Init flow` to `new-work.md`, `connectSSE`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `login.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._