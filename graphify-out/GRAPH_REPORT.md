# Graph Report - Zairen-web  (2026-10-09)

## Corpus Check
- 136 files · ~379,226 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .toml 4, (none) 3, .css 2)

## Summary
- 1548 nodes · 3398 edges · 101 communities (93 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `351c2b3d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.ts
- package.json
- pages/index.astro
- react
- CarritoDrawer.tsx
- Navbar.astro
- ProductoEditor.tsx
- admin/index.astro
- database.ts
- dependencies
- compilerOptions
- PedidosTable.tsx
- Zairen Brand Logo (Negativo)
- pnpm Workspace Build Config
- Git Development Flow & PRs
- env.d.ts
- el
- live-browser.js
- modern-screenshot.umd.js
- initPageChat
- handleKeyDown
- renderDesignVisual
- cleanup
- connectSSE
- Responsive Design
- new-work.md
- handleManualEditActivity
- onboard.md
- SKILL.md
- applyEditing
- initGlobalBar
- createLiveBrowserDomHelpers
- The Toolkit
- captureElementToBlob
- showBar
- AdminLayout.astro
- actOnAgentTarget
- showToast
- createLiveBrowserSessionState
- documentRefForElement
- onAnnotDown
- startVoice
- animate.md
- live.md
- Handle `generate`
- mountSvelteComponentVariant
- Generate Report
- New visual work
- optimize.md
- Impeccable Asset Producer
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- generate.md
- Task List
- initDesignPanel
- critique.md
- Simplify the Design
- Hardening Dimensions
- handleInsertCreate
- clarify.md
- Nielsen's 10 Heuristics
- Generate Combined Critique Report
- document.md
- polish.md
- quieter.md
- setLiveState
- Init flow
- syncEditBadgeHitProxies
- Common Cognitive Load Violations
- iOS platform
- Operate mode depth (and Read notes)
- POSTerminal.tsx
- adapt.native.md
- Android platform
- colorize.md
- Persona-Based Design Testing
- doctor.md
- Extract Flow
- Shape
- Badge.tsx
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- Diagnostic Scan
- $impeccable hooks
- Visualize: Direction Comps & Asset Production
- scripts
- ClientesTable.tsx
- Impeccable Documenter
- Region map
- Constraints // ZAIREN LAB
- devDependencies
- Heuristics Scoring Guide
- Operate
- Read
- Agent Instructions // ZAIREN LAB
- UsuariosManager.tsx

## God Nodes (most connected - your core abstractions)
1. `connectSSE()` - 34 edges
2. `react` - 34 edges
3. `setLiveState()` - 33 edges
4. `resumeSession()` - 33 edges
5. `showToast()` - 31 edges
6. `initGlobalBar()` - 30 edges
7. `siteConfig` - 30 edges
8. `el()` - 29 edges
9. `buildInsertConfigureRow()` - 27 edges
10. `handleKeyDown()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Phase 4: Configuración de Envíos, Sucursales y Selector de Moneda Unificada` --references--> `formatCurrency()`  [INFERRED]
  tasks/plan.md → src/config/site.ts
- `Risks and Mitigations` --references--> `formatCurrency()`  [INFERRED]
  tasks/plan.md → src/config/site.ts
- `Task 4.3: Selector de moneda unificada (`BOB` vs `USD`) con tasa manual` --references--> `formatCurrency()`  [INFERRED]
  tasks/todo.md → src/config/site.ts
- `Checkpoint 1: Estética Ortogonal y Modales` --references--> `InventarioManager()`  [INFERRED]
  tasks/todo.md → src/components/admin/inventario/InventarioManager.tsx
- `Task 1.2: Modal flotante para productos y tabla de inventario a pantalla completa en `InventarioManager.tsx`` --references--> `InventarioManager()`  [INFERRED]
  tasks/todo.md → src/components/admin/inventario/InventarioManager.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Zairen Brand Visual Identity Assets** — public_brand_zairen_logo_oficial_logo, public_brand_zairen_logo_negativo_logo, public_favicon_icon [EXTRACTED 1.00]

## Communities (101 total, 8 thin omitted)

### Community 0 - "site.ts"
Cohesion: 0.12
Nodes (17): Site Configuration Guide, ConfiguracionWeb(), defaultSucursales, Sucursal, bar, loader, percent, WhatsAppContactModule() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.12
Nodes (17): description, name, type, version, astro, @astrojs/cloudflare, @astrojs/react, lucide-react (+9 more)

### Community 2 - "pages/index.astro"
Cohesion: 0.13
Nodes (14): mockCollections, mockProducts, getServerSupabase(), isSupabaseConfigured, supabase, onRequest, errorBox, eyeOffIcon (+6 more)

### Community 3 - "react"
Cohesion: 0.20
Nodes (17): react, sonner, CatalogoGrid(), CatalogoGridProps, DetalleProducto(), DetalleProductoProps, ShareProductModal(), ShareProductModalProps (+9 more)

### Community 4 - "CarritoDrawer.tsx"
Cohesion: 0.25
Nodes (15): CarritoDrawer(), TurnstileWidget(), TurnstileWidgetProps, Window, CartItem, clearCart(), closeDrawer(), getCartShippingCost() (+7 more)

### Community 5 - "Navbar.astro"
Cohesion: 0.16
Nodes (16): Zairen Brand Logo (Oficial), @nanostores/react, Zairen Brand Asset Logo (Oficial), BottomNavMobile(), CartBadge(), mobileMenu, Props, toggleBtn (+8 more)

### Community 6 - "ProductoEditor.tsx"
Cohesion: 0.05
Nodes (40): initialInventoryData, InventarioManager(), InventarioTableProps, MatrizStock(), MatrizStockProps, SIZES, StockBySize, InventarioItem (+32 more)

### Community 7 - "admin/index.astro"
Cohesion: 0.13
Nodes (13): AlertasInventario(), AlertItem, initialAlerts, collectionsData, DonutColecciones(), initialOrders, PedidosPendientes(), PendingOrder (+5 more)

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
Cohesion: 0.29
Nodes (6): initialOrders, Order, OrderItem, OrderStatus, PedidosTable(), prerender

### Community 16 - "el"
Cohesion: 0.11
Nodes (37): actionLabel(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow(), buildConfigureSubmitButton() (+29 more)

### Community 17 - "live-browser.js"
Cohesion: 0.06
Nodes (56): applyGlobalBarLabelState(), applyLiveBarPreference(), applyPlaceholderSizingStyles(), buildColorModels(), buildPlaceholderResizeHandles(), buildSvelteExpressionTextMap(), buildSveltePropValuesFromLiveElement(), buildSveltePropValuesV2() (+48 more)

### Community 18 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 19 - "initPageChat"
Cohesion: 0.09
Nodes (44): agentHasWorkInFlight(), armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+36 more)

### Community 20 - "handleKeyDown"
Cohesion: 0.18
Nodes (24): beginNewLiveConfiguration(), cancelInsertConfigure(), clearAnnotations(), clearInsertPicking(), closeTunePopover(), exitConfigureToPicking(), handleClick(), handleKeyDown() (+16 more)

### Community 21 - "renderDesignVisual"
Cohesion: 0.10
Nodes (29): buildCollapsible(), buildListHtml(), buildRadiiModels(), copyToClipboard(), cssSafe(), designEmptyMessage(), escapeHtml(), fontStack() (+21 more)

### Community 22 - "cleanup"
Cohesion: 0.20
Nodes (18): abortSvelteComponentInjection(), cleanup(), cleanupAcceptedSession(), clearScrollY(), discardedWrappers(), discardStateStyleId(), recoverEmptyCycling(), releaseDiscardedStaticWrapper() (+10 more)

### Community 23 - "connectSSE"
Cohesion: 0.06
Nodes (85): applyParamDefaults(), applyParamValue(), applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), clampVariantIndex(), clearHandled(), clearSession() (+77 more)

### Community 24 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 25 - "new-work.md"
Cohesion: 0.10
Nodes (17): Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments, Verify, Visitor mode (+9 more)

### Community 26 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 27 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 28 - "SKILL.md"
Cohesion: 0.10
Nodes (15): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Craft floor, Refuse, Verify (+7 more)

### Community 29 - "applyEditing"
Cohesion: 0.19
Nodes (19): applyEditing(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), disableInlineEdit(), enterEditingMode(), finalizeInsertSession(), forbiddenManualTextChars() (+11 more)

### Community 30 - "initGlobalBar"
Cohesion: 0.13
Nodes (27): agentStatusText(), barPaletteForTheme(), brandMarkSvg(), cursorForInsertAxis(), detectPageTheme(), stopFocusOutIntoChrome(), ensureAgentPollTooltip(), handleMouseMove() (+19 more)

### Community 31 - "createLiveBrowserDomHelpers"
Cohesion: 0.11
Nodes (21): collectEditableTextRows(), visit(), createLiveBrowserDomHelpers(), cloneWithoutChrome(), cssId(), liveUiRoot(), makeFrozenAnchor(), own() (+13 more)

### Community 32 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 33 - "captureElementToBlob"
Cohesion: 0.11
Nodes (23): averageRgb01(), bufferToBase64(), captureChromeNodes(), captureElementFromRenderedAncestor(), captureElementToBlob(), collectFontCssText(), compileShader(), cssColorToRgb01() (+15 more)

### Community 34 - "showBar"
Cohesion: 0.16
Nodes (18): applyConfigureBarChrome(), buildConfirmedRow(), buildCyclingRow(), buildDots(), buildGeneratingRow(), buildSavingRow(), cycleVariant(), cyclingCounterText() (+10 more)

### Community 35 - "AdminLayout.astro"
Cohesion: 0.13
Nodes (12): Zairen Favicon, Zairen Lab Tokyo Experimental Apparel, AdminSidebar(), AdminSidebarProps, SimuladorCatalogo(), Toaster(), Props, wrapper (+4 more)

### Community 36 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 37 - "showToast"
Cohesion: 0.19
Nodes (15): abandonForeignSession(), abandonSupersededGo(), captureAndEmit(), checkpointPayload(), discardOrphanedSession(), handleDiscard(), markSessionHandled(), maybePrefetchPage() (+7 more)

### Community 38 - "createLiveBrowserSessionState"
Cohesion: 0.22
Nodes (15): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+7 more)

### Community 39 - "documentRefForElement"
Cohesion: 0.08
Nodes (32): addManualContextText(), canRestoreManualEditElement(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext(), copyEditLeafContext(), cssIdent() (+24 more)

### Community 40 - "onAnnotDown"
Cohesion: 0.20
Nodes (17): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay(), localCoords() (+9 more)

### Community 41 - "startVoice"
Cohesion: 0.29
Nodes (11): finishVoiceSession(), isEmbeddedPreviewBrowser(), releaseVoiceEngine(), startVoice(), steerSpeechRecognitionCtor(), steerVoiceContext(), steerVoiceErrorMessage(), steerVoiceUnavailableMessage() (+3 more)

### Community 42 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 43 - "live.md"
Cohesion: 0.12
Nodes (15): Cleanup, Exit, First-time setup, Handle `accept`, Handle `discard`, Handle fallback, Handle `manual_edit_apply`, Handle `prefetch` (+7 more)

### Community 44 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 45 - "mountSvelteComponentVariant"
Cohesion: 0.11
Nodes (31): acceptedDomAlreadyClean(), applyOriginalAttrsToSvelteAnchor(), clearHandledWrapperReloadStamp(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), deferredRecoverySuperseded(), describeMountFailure(), detectDevServerBase() (+23 more)

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

### Community 51 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 52 - "Task List"
Cohesion: 0.13
Nodes (14): Architecture Decisions, Checkpoint: Ajustes de Negocio, Checkpoint: Autenticación y Contraste, Checkpoint: Estética Ortogonal y Modales, Checkpoint: Navegación y Footer, Implementation Plan: Estética Ortogonal Zairen Lab, Moneda Dinámica, Mejoras Admin y Rediseño de Navegación, Overview, Phase 1: Estética Ortogonal Global, Modales y Detalle de Producto (+6 more)

### Community 53 - "initDesignPanel"
Cohesion: 0.39
Nodes (8): buildDesignHeader(), designPanelCss(), fetchDesignSystem(), initDesignPanel(), loadDesignPrefs(), renderDesignChrome(), saveDesignPrefs(), toggleDesignPanel()

### Community 54 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 55 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 56 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 57 - "handleInsertCreate"
Cohesion: 0.24
Nodes (10): buildInsertPlaceholderSnapshotFromDom(), canCreateInsert(), handleInsertCreate(), hideInsertCreateTooltip(), insertCreateDisabledReason(), insertCreateGateState(), resolveScrollLockAnchorTop(), startScrollLock() (+2 more)

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

### Community 64 - "setLiveState"
Cohesion: 0.36
Nodes (8): buildPickedAnchorSnapshot(), clearMountErrorCard(), handleGo(), mountErrorCardBottomOffset(), renderMountErrorCard(), retryMountErrorCard(), setLiveState(), truncateMiddle()

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

### Community 70 - "POSTerminal.tsx"
Cohesion: 0.22
Nodes (8): CartItem, initialRecentSales, mockCatalog, POSProduct, POSTerminal(), SaleRecord, prerender, prerender

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

### Community 75 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 76 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

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

### Community 85 - "$impeccable hooks"
Cohesion: 0.33
Nodes (6): Constraints, Failure modes, Flow, $impeccable hooks, Routing, Triage findings

### Community 86 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 88 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, check, dev, preview, start

### Community 89 - "ClientesTable.tsx"
Cohesion: 0.40
Nodes (4): ClienteRecord, ClientesTable(), mockClientes, prerender

### Community 90 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

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

### Community 100 - "UsuariosManager.tsx"
Cohesion: 0.29
Nodes (5): initialUsuarios, UserRole, UsuarioRecord, UsuariosManager(), prerender

## Knowledge Gaps
- **564 isolated node(s):** `name`, `type`, `version`, `description`, `dev` (+559 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 601 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `initGlobalBar` to `setLiveState`, `Init flow`, `syncEditBadgeHitProxies`, `onAnnotDown`, `doctor.md`, `live-browser.js`, `generate.md`, `initPageChat`, `handleKeyDown`, `initDesignPanel`, `connectSSE`, `handleManualEditActivity`, `SKILL.md`?**
  _High betweenness centrality (0.263) - this node is a cross-community bridge._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _564 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Why does `Commands` connect `SKILL.md` to `initGlobalBar`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.12280701754385964 - nodes in this community are weakly interconnected._
- **Why does `Reference Material` connect `Heuristics Scoring Guide` to `Cognitive Load Assessment`, `Persona-Based Design Testing`, `critique.md`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `pages/index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.13405797101449277 - nodes in this community are weakly interconnected._