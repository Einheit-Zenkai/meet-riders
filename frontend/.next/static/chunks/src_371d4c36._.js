(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/ui/hostbutton.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>HostButton
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
;
;
;
function HostButton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-10 right-4 hidden sm:block sm:right-6 group z-[60]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/hostparty",
                className: "flex items-center justify-center w-20 h-20 bg-black rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                    className: "w-10 h-10 text-white"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/hostbutton.tsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/hostbutton.tsx",
                lineNumber: 7,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-1/2 right-full mr-4 flex translate-y-1/2 items-center px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap",
                children: "Host Ride"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/hostbutton.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/hostbutton.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = HostButton;
var _c;
__turbopack_context__.k.register(_c, "HostButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/stores/dashboardFiltersStore.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const INITIAL_STATE = {
    destinationQuery: "",
    timeWindowMins: "any",
    sameDepartment: false,
    sameYear: false,
    showFriendsOnly: false,
    showMyUniversityOnly: false
};
const useDashboardFiltersStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        ...INITIAL_STATE,
        setDestinationQuery: (value)=>set({
                destinationQuery: value
            }),
        setTimeWindowMins: (value)=>set({
                timeWindowMins: value
            }),
        setSameDepartment: (value)=>set({
                sameDepartment: value
            }),
        setSameYear: (value)=>set({
                sameYear: value
            }),
        setShowFriendsOnly: (value)=>set({
                showFriendsOnly: value
            }),
        setShowMyUniversityOnly: (value)=>set({
                showMyUniversityOnly: value
            }),
        resetFilters: ()=>set(()=>({
                    ...INITIAL_STATE
                }))
    }));
const __TURBOPACK__default__export__ = useDashboardFiltersStore;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>SearchAndFilters
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/funnel.js [app-client] (ecmascript) <export default as Filter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dashboardFiltersStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function SearchAndFilters() {
    _s();
    const [showFilters, setShowFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const filtersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const destinationQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[destinationQuery]": (state)=>state.destinationQuery
    }["SearchAndFilters.useDashboardFiltersStore[destinationQuery]"]);
    const setDestinationQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[setDestinationQuery]": (state)=>state.setDestinationQuery
    }["SearchAndFilters.useDashboardFiltersStore[setDestinationQuery]"]);
    const timeWindowMins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[timeWindowMins]": (state)=>state.timeWindowMins
    }["SearchAndFilters.useDashboardFiltersStore[timeWindowMins]"]);
    const setTimeWindowMins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[setTimeWindowMins]": (state)=>state.setTimeWindowMins
    }["SearchAndFilters.useDashboardFiltersStore[setTimeWindowMins]"]);
    const sameDepartment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[sameDepartment]": (state)=>state.sameDepartment
    }["SearchAndFilters.useDashboardFiltersStore[sameDepartment]"]);
    const setSameDepartment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[setSameDepartment]": (state)=>state.setSameDepartment
    }["SearchAndFilters.useDashboardFiltersStore[setSameDepartment]"]);
    const sameYear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[sameYear]": (state)=>state.sameYear
    }["SearchAndFilters.useDashboardFiltersStore[sameYear]"]);
    const setSameYear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[setSameYear]": (state)=>state.setSameYear
    }["SearchAndFilters.useDashboardFiltersStore[setSameYear]"]);
    const showFriendsOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[showFriendsOnly]": (state)=>state.showFriendsOnly
    }["SearchAndFilters.useDashboardFiltersStore[showFriendsOnly]"]);
    const setShowFriendsOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[setShowFriendsOnly]": (state)=>state.setShowFriendsOnly
    }["SearchAndFilters.useDashboardFiltersStore[setShowFriendsOnly]"]);
    const showMyUniversityOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[showMyUniversityOnly]": (state)=>state.showMyUniversityOnly
    }["SearchAndFilters.useDashboardFiltersStore[showMyUniversityOnly]"]);
    const setShowMyUniversityOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "SearchAndFilters.useDashboardFiltersStore[setShowMyUniversityOnly]": (state)=>state.setShowMyUniversityOnly
    }["SearchAndFilters.useDashboardFiltersStore[setShowMyUniversityOnly]"]);
    // Close filters when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchAndFilters.useEffect": ()=>{
            const handleClickOutside = {
                "SearchAndFilters.useEffect.handleClickOutside": (event)=>{
                    if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                        setShowFilters(false);
                    }
                }
            }["SearchAndFilters.useEffect.handleClickOutside"];
            if (showFilters) {
                document.addEventListener("mousedown", handleClickOutside);
            }
            return ({
                "SearchAndFilters.useEffect": ()=>{
                    document.removeEventListener("mousedown", handleClickOutside);
                }
            })["SearchAndFilters.useEffect"];
        }
    }["SearchAndFilters.useEffect"], [
        showFilters
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 relative",
        ref: filtersRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                className: "w-full p-3 pr-11 rounded-full bg-[rgba(255,255,255,0.63)] dark:bg-[rgba(15,15,15,0.48)] text-foreground placeholder:text-muted-foreground shadow-[0_4px_30px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-ring border border-[rgba(255,255,255,0.27)] backdrop-blur-[2.2px] ",
                style: {
                    WebkitBackdropFilter: "blur(2.2px)"
                },
                placeholder: "Search destination (e.g., MG Road, North Gate)",
                value: destinationQuery,
                onChange: (e)=>setDestinationQuery(e.target.value)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent",
                title: "Filters",
                onClick: ()=>setShowFilters(!showFilters),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            showFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-50 mt-2 w-80 rounded-[16px] border border-[rgba(255,255,255,0.27)] bg-[rgba(255,255,255,0.63)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px] p-3",
                style: {
                    WebkitBackdropFilter: "blur(2.2px)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: "timeWindow",
                            className: "text-sm font-medium text-muted-foreground",
                            children: "Expiring within"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                            lineNumber: 66,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            id: "timeWindow",
                            className: "w-full p-2 border rounded-md bg-background",
                            value: timeWindowMins,
                            onChange: (e)=>setTimeWindowMins(e.target.value),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "any",
                                    children: "Any time"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "10",
                                    children: "10 minutes"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "15",
                                    children: "15 minutes"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 77,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "30",
                                    children: "30 minutes"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "60",
                                    children: "1 hour"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 79,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 pt-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    disabled: true,
                                    checked: sameDepartment,
                                    onChange: (e)=>setSameDepartment(e.target.checked)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 83,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Same department (coming soon)"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 89,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                            lineNumber: 82,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    disabled: true,
                                    checked: sameYear,
                                    onChange: (e)=>setSameYear(e.target.checked)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Same year (coming soon)"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 99,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 pt-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: showFriendsOnly,
                                    onChange: (e)=>setShowFriendsOnly(e.target.checked)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 102,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-foreground",
                                    children: "Connections' Parties only"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 107,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                            lineNumber: 101,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: showMyUniversityOnly,
                                    onChange: (e)=>setShowMyUniversityOnly(e.target.checked)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 110,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-foreground",
                                    children: "My University only"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                                    lineNumber: 115,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                            lineNumber: 109,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                    lineNumber: 65,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(SearchAndFilters, "v8ZASZAbbYDuEtj3RwsDBngkjrs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = SearchAndFilters;
var _c;
__turbopack_context__.k.register(_c, "SearchAndFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/stores/notificationsStore.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useNotificationsStore": ()=>useNotificationsStore
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useNotificationsStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        notifications: [],
        add: (n)=>set((state)=>{
                if (state.notifications.some((x)=>x.id === n.id)) return state; // de-dup
                return {
                    notifications: [
                        n,
                        ...state.notifications
                    ]
                };
            }),
        markRead: (id)=>set((state)=>({
                    notifications: state.notifications.map((n)=>n.id === id ? {
                            ...n,
                            read: true
                        } : n)
                })),
        markAllRead: ()=>set((state)=>({
                    notifications: state.notifications.map((n)=>({
                            ...n,
                            read: true
                        }))
                })),
        unreadCount: ()=>get().notifications.filter((n)=>!n.read).length,
        has: (id)=>get().notifications.some((n)=>n.id === id)
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>NotificationsDropdown
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/notificationsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function NotificationsDropdown() {
    _s();
    const [showDropdown, setShowDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const notifications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"])({
        "NotificationsDropdown.useNotificationsStore[notifications]": (s)=>s.notifications
    }["NotificationsDropdown.useNotificationsStore[notifications]"]);
    const unreadCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"])({
        "NotificationsDropdown.useNotificationsStore[unreadCount]": (s)=>s.unreadCount()
    }["NotificationsDropdown.useNotificationsStore[unreadCount]"]);
    const markRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"])({
        "NotificationsDropdown.useNotificationsStore[markRead]": (s)=>s.markRead
    }["NotificationsDropdown.useNotificationsStore[markRead]"]);
    const markAllRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"])({
        "NotificationsDropdown.useNotificationsStore[markAllRead]": (s)=>s.markAllRead
    }["NotificationsDropdown.useNotificationsStore[markAllRead]"]);
    // Close dropdown when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationsDropdown.useEffect": ()=>{
            const handleClickOutside = {
                "NotificationsDropdown.useEffect.handleClickOutside": (event)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                        setShowDropdown(false);
                    }
                }
            }["NotificationsDropdown.useEffect.handleClickOutside"];
            if (showDropdown) {
                document.addEventListener("mousedown", handleClickOutside);
            }
            return ({
                "NotificationsDropdown.useEffect": ()=>{
                    document.removeEventListener("mousedown", handleClickOutside);
                }
            })["NotificationsDropdown.useEffect"];
        }
    }["NotificationsDropdown.useEffect"], [
        showDropdown
    ]);
    const onClickNotification = (id, href)=>{
        markRead(id);
        if (href) router.push(href);
        setShowDropdown(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "p-2 rounded-full border hover:bg-accent hover:shadow-[0_0_20px_4px_rgba(255,43,99,0.35)] relative",
                title: "Notifications",
                onClick: ()=>setShowDropdown(!showDropdown),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                        className: "w-5 h-5"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
                        children: unreadCount > 9 ? '9+' : unreadCount
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            showDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 mt-2 w-80 rounded-md border bg-card/95 backdrop-blur shadow-lg z-50 max-h-96 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 border-b",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-semibold text-sm",
                                    children: "Notifications"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                    lineNumber: 59,
                                    columnNumber: 15
                                }, this),
                                unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "text-xs text-primary hover:underline",
                                    onClick: ()=>markAllRead(),
                                    children: "Mark all read"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                    lineNumber: 61,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this),
                    notifications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 text-center text-sm text-muted-foreground",
                        children: "No notifications"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 67,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divide-y",
                        children: notifications.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onClickNotification(n.id, n.href),
                                className: "w-full text-left p-3 hover:bg-accent/50 ".concat(!n.read ? 'bg-accent/20' : ''),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        children: n.message
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                        lineNumber: 78,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-1",
                                        children: n.timestamp.toLocaleTimeString()
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                        lineNumber: 79,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, n.id, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                lineNumber: 73,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(NotificationsDropdown, "a/y+Yu2sPAr6uUTtI4rffuXCmvE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationsStore"]
    ];
});
_c = NotificationsDropdown;
var _c;
__turbopack_context__.k.register(_c, "NotificationsDropdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/ThemeToggle.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>ThemeToggle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ThemeToggle() {
    _s();
    const [isDark, setIsDark] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeToggle.useEffect": ()=>{
            // Check initial theme
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        }
    }["ThemeToggle.useEffect"], []);
    const toggleTheme = ()=>{
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: "p-2 rounded-full border hover:bg-accent transition-colors",
        title: "Switch to ".concat(isDark ? 'light' : 'dark', " mode"),
        onClick: toggleTheme,
        children: isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/dashboard/components/ThemeToggle.tsx",
            lineNumber: 35,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/dashboard/components/ThemeToggle.tsx",
            lineNumber: 37,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/dashboard/components/ThemeToggle.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_s(ThemeToggle, "q9ovQTvwIdpxeVii6kJLTuTYpwE=");
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/LogoutButton.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>LogoutButton
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function LogoutButton() {
    _s();
    const [showDialog, setShowDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoggingOut, setIsLoggingOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleLogout = async ()=>{
        setIsLoggingOut(true);
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "p-2 rounded-md border hover:bg-accent flex items-center gap-2 transition-colors",
                title: "Log out",
                onClick: ()=>setShowDialog(true),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                        className: "w-5 h-5"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "hidden sm:inline",
                        children: "Log out"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            showDialog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-card border rounded-lg shadow-lg w-full max-w-sm p-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold mb-2",
                            children: "Sign out"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground mb-4",
                            children: "Are you sure you want to log out?"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-2 rounded-md border hover:bg-accent transition-colors",
                                    onClick: ()=>setShowDialog(false),
                                    disabled: isLoggingOut,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                                    lineNumber: 43,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50",
                                    onClick: handleLogout,
                                    disabled: isLoggingOut,
                                    children: isLoggingOut ? 'Logging out...' : 'Yes, log out'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                                    lineNumber: 50,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                            lineNumber: 42,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                    lineNumber: 37,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/LogoutButton.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(LogoutButton, "Bu8q/9HafGpaGxGiqxYPC4W8j5s=");
_c = LogoutButton;
var _c;
__turbopack_context__.k.register(_c, "LogoutButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>DashboardHeader
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$SearchAndFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/SearchAndFilters.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$NotificationsDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/ThemeToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$LogoutButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/LogoutButton.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function DashboardHeader(param) {
    let { welcomeName } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3 mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$SearchAndFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$NotificationsDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$LogoutButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl md:text-3xl font-bold text-foreground",
                children: welcomeName ? "Welcome back, ".concat(welcomeName) : 'Meet Riders'
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = DashboardHeader;
var _c;
__turbopack_context__.k.register(_c, "DashboardHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": ()=>cn
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex hover:cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-[0_0_0_0_rgba(0,0,0,0)]", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_26px_6px_rgba(255,43,99,0.55)]",
            destructive: "bg-destructive text-white hover:bg-destructive/90 hover:shadow-[0_0_26px_6px_rgba(239,68,68,0.55)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_22px_4px_rgba(209,42,90,0.45)] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_22px_4px_rgba(209,42,90,0.45)]",
            ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_20px_4px_rgba(255,43,99,0.45)] dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button(param) {
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/card.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": ()=>Card,
    "CardAction": ()=>CardAction,
    "CardContent": ()=>CardContent,
    "CardDescription": ()=>CardDescription,
    "CardFooter": ()=>CardFooter,
    "CardHeader": ()=>CardHeader,
    "CardTitle": ()=>CardTitle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/avatar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Avatar": ()=>Avatar,
    "AvatarFallback": ()=>AvatarFallback,
    "AvatarImage": ()=>AvatarImage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-avatar/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Avatar(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "avatar",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex size-8 shrink-0 overflow-hidden rounded-full", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/avatar.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Avatar;
function AvatarImage(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Image"], {
        "data-slot": "avatar-image",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("aspect-square size-full", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/avatar.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_c1 = AvatarImage;
function AvatarFallback(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$avatar$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fallback"], {
        "data-slot": "avatar-fallback",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-muted flex size-full items-center justify-center rounded-full", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/avatar.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c2 = AvatarFallback;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Avatar");
__turbopack_context__.k.register(_c1, "AvatarImage");
__turbopack_context__.k.register(_c2, "AvatarFallback");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/stores/dashboardDataStore.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/authStore.ts [app-client] (ecmascript)");
;
;
;
const initialState = {
    welcomeName: null,
    viewerUniversity: null,
    parties: [],
    partiesLoading: true,
    isCheckingProfile: true
};
const useDashboardDataStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        ...initialState,
        refreshProfile: async ()=>{
            const user = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().user;
            if (!user) {
                set({
                    ...initialState,
                    partiesLoading: false,
                    isCheckingProfile: false
                });
                return "no-user";
            }
            set({
                isCheckingProfile: true
            });
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                const { data: profile, error } = await supabase.from("profiles").select("nickname, full_name, university").eq("id", user.id).single();
                if (error) {
                    console.error("Error fetching profile:", error);
                    set({
                        welcomeName: null,
                        viewerUniversity: null,
                        isCheckingProfile: false
                    });
                    return "error";
                }
                if (!profile || !profile.nickname && !profile.full_name) {
                    set({
                        welcomeName: null,
                        viewerUniversity: null,
                        isCheckingProfile: false
                    });
                    return "needs-onboarding";
                }
                set({
                    welcomeName: profile.nickname || profile.full_name || "Rider",
                    viewerUniversity: profile.university || null,
                    isCheckingProfile: false
                });
                return "ok";
            } catch (error) {
                console.error("Profile check failed:", error);
                set({
                    welcomeName: null,
                    viewerUniversity: null,
                    isCheckingProfile: false
                });
                return "error";
            }
        },
        refreshParties: async ()=>{
            const user = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().user;
            if (!user) {
                set({
                    parties: [],
                    partiesLoading: false
                });
                return "no-user";
            }
            set({
                partiesLoading: true
            });
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                const nowIso = new Date().toISOString();
                const { data: partiesData, error } = await supabase.from("parties").select("\n          id,\n          created_at,\n          updated_at,\n          host_id,\n          party_size,\n          duration_minutes,\n          expires_at,\n          meetup_point,\n          drop_off,\n          is_friends_only,\n          is_gender_only,\n          ride_options,\n          host_comments,\n          host_university,\n          display_university,\n          is_active\n        ").eq("is_active", true).gt("expires_at", nowIso).order("created_at", {
                    ascending: false
                });
                if (error) {
                    console.error("Error fetching parties:", error);
                    set({
                        parties: [],
                        partiesLoading: false
                    });
                    return "error";
                }
                if (!partiesData || partiesData.length === 0) {
                    set({
                        parties: [],
                        partiesLoading: false
                    });
                    return "ok";
                }
                const hostIds = [
                    ...new Set(partiesData.map((party)=>party.host_id))
                ];
                // Determine which hosts are "connections" with the viewer (either direction)
                const connectedHostIds = new Set();
                if (hostIds.length > 0) {
                    const { data: relFromMe } = await supabase.from("user_relationships").select("receiver_id, status").eq("initiator_id", user.id).in("receiver_id", hostIds).eq("status", "connected");
                    relFromMe === null || relFromMe === void 0 ? void 0 : relFromMe.forEach((r)=>connectedHostIds.add(r.receiver_id));
                    const { data: relToMe } = await supabase.from("user_relationships").select("initiator_id, status").eq("receiver_id", user.id).in("initiator_id", hostIds).eq("status", "connected");
                    relToMe === null || relToMe === void 0 ? void 0 : relToMe.forEach((r)=>connectedHostIds.add(r.initiator_id));
                }
                // Enforce visibility: connections-only parties appear only if viewer is connected to host
                const visiblePartiesData = (partiesData || []).filter((p)=>{
                    return !p.is_friends_only || connectedHostIds.has(p.host_id);
                });
                const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("\n          id,\n          full_name,\n          nickname,\n          gender,\n          avatar_url,\n          university,\n          points,\n          phone_number,\n          show_phone,\n          major,\n          bio\n        ").in("id", hostIds);
                if (profilesError) {
                    console.error("Error fetching profiles:", profilesError);
                }
                const profilesMap = new Map();
                profilesData === null || profilesData === void 0 ? void 0 : profilesData.forEach((profile)=>{
                    profilesMap.set(profile.id, profile);
                });
                const partyIds = visiblePartiesData.map((party)=>party.id);
                const memberCounts = await Promise.all(partyIds.map(async (partyId)=>{
                    const { data: count } = await supabase.rpc("get_party_member_count", {
                        p_party_id: partyId
                    });
                    return {
                        partyId,
                        count: count || 0
                    };
                }));
                const memberCountsMap = new Map();
                memberCounts.forEach((param)=>{
                    let { partyId, count } = param;
                    memberCountsMap.set(partyId, count);
                });
                const { data: userMemberships } = await supabase.from("party_members").select("party_id").eq("user_id", user.id).eq("status", "joined").in("party_id", partyIds);
                const userMembershipSet = new Set((userMemberships === null || userMemberships === void 0 ? void 0 : userMemberships.map((membership)=>membership.party_id)) || []);
                const transformedParties = visiblePartiesData.map((party)=>({
                        ...party,
                        created_at: new Date(party.created_at),
                        updated_at: party.updated_at ? new Date(party.updated_at) : new Date(party.created_at),
                        expires_at: party.expires_at ? new Date(party.expires_at) : new Date(),
                        ride_options: Array.isArray(party.ride_options) ? party.ride_options : [],
                        is_active: Boolean(party.is_active),
                        display_university: Boolean(party.display_university),
                        host_profile: profilesMap.get(party.host_id),
                        current_member_count: memberCountsMap.get(party.id) || 0,
                        user_is_member: userMembershipSet.has(party.id)
                    }));
                set({
                    parties: transformedParties,
                    partiesLoading: false
                });
                return "ok";
            } catch (error) {
                console.error("Failed to fetch parties:", error);
                set({
                    parties: [],
                    partiesLoading: false
                });
                return "error";
            }
        },
        reset: ()=>{
            set({
                ...initialState,
                partiesLoading: false,
                isCheckingProfile: false
            });
        }
    }));
const __TURBOPACK__default__export__ = useDashboardDataStore;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/services/partyMemberService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Service functions for party member operations
__turbopack_context__.s({
    "PartyMemberService": ()=>PartyMemberService,
    "partyMemberService": ()=>partyMemberService
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
;
;
class PartyMemberService {
    /**
   * Join a party as the current user
   */ async joinParty(partyId, pickupNotes) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return {
                    success: false,
                    error: "User not authenticated"
                };
            }
            // Check if user can join the party using our helper function
            const { data: canJoin, error: checkError } = await this.supabase.rpc('can_user_join_party', {
                p_party_id: partyId,
                p_user_id: user.id
            });
            if (checkError) {
                console.error('Error checking join eligibility:', checkError);
                return {
                    success: false,
                    error: "Failed to verify join eligibility"
                };
            }
            if (!canJoin) {
                return {
                    success: false,
                    error: "Cannot join this party (full, expired, or already a member)"
                };
            }
            // Join the party
            const { data: memberRow, error: joinError } = await this.supabase.from('party_members').insert({
                party_id: partyId,
                user_id: user.id,
                status: 'joined',
                pickup_notes: pickupNotes || null,
                contact_shared: false
            }).select().single();
            if (joinError) {
                console.error('Error joining party:', (joinError === null || joinError === void 0 ? void 0 : joinError.message) || joinError);
                return {
                    success: false,
                    error: "Failed to join party"
                };
            }
            if (!memberRow) {
                return {
                    success: false,
                    error: "Failed to join party"
                };
            }
            // Fetch the member profile in a follow-up query to avoid relying on implicit FK relationships
            let profile = null;
            const { data: profileRow, error: profileError } = await this.supabase.from('profiles').select('id, full_name, nickname, avatar_url, gender, points, university, show_university, phone_number, show_phone, created_at, updated_at, birth_date').eq('id', memberRow.user_id).single();
            if (profileError) {
                var _this, _this1;
                const errMsg = ((_this = profileError) === null || _this === void 0 ? void 0 : _this.message) || ((_this1 = profileError) === null || _this1 === void 0 ? void 0 : _this1.hint) || JSON.stringify(profileError);
                console.warn('Joined member profile fetch failed; continuing without profile details:', errMsg);
            } else {
                profile = profileRow;
            }
            // Transform the data to match our PartyMember type
            const transformedMember = {
                ...memberRow,
                joined_at: new Date(memberRow.joined_at),
                left_at: memberRow.left_at ? new Date(memberRow.left_at) : undefined,
                created_at: new Date(memberRow.created_at),
                updated_at: new Date(memberRow.updated_at),
                profile: profile ? {
                    ...profile,
                    created_at: profile.created_at ? new Date(profile.created_at) : null,
                    updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
                    birth_date: profile.birth_date ? new Date(profile.birth_date) : null
                } : undefined
            };
            return {
                success: true,
                member: transformedMember
            };
        } catch (error) {
            console.error('Unexpected error joining party:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Leave a party as the current user
   */ async leaveParty(partyId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return {
                    success: false,
                    error: "User not authenticated"
                };
            }
            // Update the member status to 'left'
            const { error } = await this.supabase.from('party_members').update({
                status: 'left',
                left_at: new Date().toISOString()
            }).eq('party_id', partyId).eq('user_id', user.id).eq('status', 'joined');
            if (error) {
                console.error('Error leaving party:', error);
                return {
                    success: false,
                    error: "Failed to leave party"
                };
            }
            return {
                success: true
            };
        } catch (error) {
            console.error('Unexpected error leaving party:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Get party members for a specific party
   */ async getPartyMembers(partyId) {
        try {
            // 1) Fetch raw members without cross-table joins to avoid RLS/relationship issues
            const { data: memberRows, error: memberErr } = await this.supabase.from('party_members').select('*').eq('party_id', partyId).eq('status', 'joined').order('joined_at', {
                ascending: true
            });
            if (memberErr) {
                var _this, _this1;
                const errMsg = ((_this = memberErr) === null || _this === void 0 ? void 0 : _this.message) || ((_this1 = memberErr) === null || _this1 === void 0 ? void 0 : _this1.hint) || JSON.stringify(memberErr);
                console.error('Error fetching party members (base rows):', errMsg);
                return {
                    success: false,
                    error: 'Failed to fetch party members'
                };
            }
            const members = memberRows || [];
            const userIds = members.map((m)=>m.user_id).filter(Boolean);
            // 2) If there are members, fetch their profiles in a second query
            let profilesById = {};
            if (userIds.length > 0) {
                const { data: profiles, error: profileErr } = await this.supabase.from('profiles').select('id, full_name, nickname, avatar_url, gender, points, university, show_university, phone_number, show_phone, created_at, updated_at, birth_date').in('id', userIds);
                if (profileErr) {
                    var _this2, _this3;
                    const errMsg = ((_this2 = profileErr) === null || _this2 === void 0 ? void 0 : _this2.message) || ((_this3 = profileErr) === null || _this3 === void 0 ? void 0 : _this3.hint) || JSON.stringify(profileErr);
                    // If profiles are blocked by RLS, we still return members without profile to avoid hard failure
                    console.warn('Profiles fetch blocked or failed; continuing without profile details:', errMsg);
                } else {
                    profilesById = (profiles || []).reduce((acc, p)=>{
                        acc[p.id] = p;
                        return acc;
                    }, {});
                }
            }
            // 3) Transform and attach profiles when available
            const transformedMembers = members.map((member)=>{
                const profile = profilesById[member.user_id];
                return {
                    ...member,
                    joined_at: new Date(member.joined_at),
                    left_at: member.left_at ? new Date(member.left_at) : undefined,
                    created_at: new Date(member.created_at),
                    updated_at: new Date(member.updated_at),
                    profile: profile ? {
                        ...profile,
                        created_at: profile.created_at ? new Date(profile.created_at) : null,
                        updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
                        birth_date: profile.birth_date ? new Date(profile.birth_date) : null
                    } : undefined
                };
            });
            return {
                success: true,
                members: transformedMembers
            };
        } catch (error) {
            console.error('Unexpected error fetching party members:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Get member count for a party
   */ async getPartyMemberCount(partyId) {
        try {
            const { data: count, error } = await this.supabase.rpc('get_party_member_count', {
                p_party_id: partyId
            });
            if (error) {
                console.error('Error getting member count:', error);
                return {
                    success: false,
                    error: "Failed to get member count"
                };
            }
            return {
                success: true,
                count: count || 0
            };
        } catch (error) {
            console.error('Unexpected error getting member count:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Check if current user is a member of a party
   */ async isUserMember(partyId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return {
                    success: true,
                    isMember: false
                };
            }
            const { data: membership, error } = await this.supabase.from('party_members').select('id').eq('party_id', partyId).eq('user_id', user.id).eq('status', 'joined').single();
            if (error && error.code !== 'PGRST116') {
                console.error('Error checking membership:', error);
                return {
                    success: false,
                    error: "Failed to check membership"
                };
            }
            return {
                success: true,
                isMember: !!membership
            };
        } catch (error) {
            console.error('Unexpected error checking membership:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /** Host-only: kick a member from a party via RPC */ async kickMember(partyId, memberUserId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: 'Not authenticated'
            };
            const { error } = await this.supabase.rpc('kick_party_member', {
                p_party_id: partyId,
                p_member_user_id: memberUserId
            });
            if (error) return {
                success: false,
                error: error.message
            };
            return {
                success: true
            };
        } catch (e) {
            return {
                success: false,
                error: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to kick member'
            };
        }
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "supabase", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])());
    }
}
const partyMemberService = new PartyMemberService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Dialog": ()=>Dialog,
    "DialogClose": ()=>DialogClose,
    "DialogContent": ()=>DialogContent,
    "DialogDescription": ()=>DialogDescription,
    "DialogFooter": ()=>DialogFooter,
    "DialogHeader": ()=>DialogHeader,
    "DialogOverlay": ()=>DialogOverlay,
    "DialogPortal": ()=>DialogPortal,
    "DialogTitle": ()=>DialogTitle,
    "DialogTrigger": ()=>DialogTrigger
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as XIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
function Dialog(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dialog",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Dialog;
function DialogTrigger(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dialog-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = DialogTrigger;
function DialogPortal(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dialog-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = DialogPortal;
function DialogClose(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
        "data-slot": "dialog-close",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
_c3 = DialogClose;
function DialogOverlay(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        "data-slot": "dialog-overlay",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c4 = DialogOverlay;
function DialogContent(param) {
    let { className, children, showCloseButton = true, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        "data-slot": "dialog-portal",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/ui/dialog.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                "data-slot": "dialog-content",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className),
                ...props,
                children: [
                    children,
                    showCloseButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        "data-slot": "dialog-close",
                        className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__["XIcon"], {}, void 0, false, {
                                fileName: "[project]/src/components/ui/dialog.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/dialog.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/dialog.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/dialog.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c5 = DialogContent;
function DialogHeader(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c6 = DialogHeader;
function DialogFooter(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_c7 = DialogFooter;
function DialogTitle(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        "data-slot": "dialog-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_c8 = DialogTitle;
function DialogDescription(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        "data-slot": "dialog-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, this);
}
_c9 = DialogDescription;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Dialog");
__turbopack_context__.k.register(_c1, "DialogTrigger");
__turbopack_context__.k.register(_c2, "DialogPortal");
__turbopack_context__.k.register(_c3, "DialogClose");
__turbopack_context__.k.register(_c4, "DialogOverlay");
__turbopack_context__.k.register(_c5, "DialogContent");
__turbopack_context__.k.register(_c6, "DialogHeader");
__turbopack_context__.k.register(_c7, "DialogFooter");
__turbopack_context__.k.register(_c8, "DialogTitle");
__turbopack_context__.k.register(_c9, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>PartyMembersDialog
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/services/partyMemberService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/authStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function PartyMembersDialog(param) {
    let { party, children } = param;
    var _party_host_profile, _party_host_profile_nickname, _party_host_profile1, _party_host_profile_full_name, _party_host_profile2, _party_host_profile3, _party_host_profile4, _party_host_profile5, _party_host_profile6;
    _s();
    const [members, setMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const isHost = (user === null || user === void 0 ? void 0 : user.id) === party.host_id;
    const fetchMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PartyMembersDialog.useCallback[fetchMembers]": async ()=>{
            if (!isOpen) return;
            setIsLoading(true);
            try {
                // Only host or joined members should fetch the list to respect RLS
                if (!isHost && !party.user_is_member) {
                    setMembers([]);
                    return;
                }
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["partyMemberService"].getPartyMembers(party.id);
                if (result.success && result.members) {
                    setMembers(result.members);
                } else if (!result.success) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(result.error || 'Failed to fetch party members');
                }
            } catch (error) {
                console.error('Error fetching party members:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to fetch party members');
            } finally{
                setIsLoading(false);
            }
        }
    }["PartyMembersDialog.useCallback[fetchMembers]"], [
        isHost,
        isOpen,
        party.id,
        party.user_is_member
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PartyMembersDialog.useEffect": ()=>{
            if (isOpen) {
                fetchMembers();
            }
        }
    }["PartyMembersDialog.useEffect"], [
        fetchMembers,
        isOpen
    ]);
    const getDisplayName = (member)=>{
        const profile = member.profile;
        if (!profile) return 'Anonymous Member';
        return profile.nickname || profile.full_name || 'Anonymous Member';
    };
    const getInitials = (member)=>{
        const profile = member.profile;
        if (!profile) return 'M';
        const name = profile.nickname || profile.full_name;
        if (!name) return 'M';
        return name.split(' ').map((word)=>word.charAt(0).toUpperCase()).slice(0, 2).join('');
    };
    const formatJoinTime = (joinedAt)=>{
        const now = new Date();
        const diffMs = now.getTime() - joinedAt.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) return 'Just joined';
        if (diffMins < 60) return "".concat(diffMins, "m ago");
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return "".concat(diffHours, "h ago");
        const diffDays = Math.floor(diffHours / 24);
        return "".concat(diffDays, "d ago");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: isOpen,
        onOpenChange: setIsOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                asChild: true,
                children: children
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                className: "sm:max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                "Party Members (",
                                (party.current_member_count || 0) + 1,
                                "/",
                                party.party_size,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 max-h-96 overflow-y-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 p-3 bg-primary/5 rounded-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                        className: "w-10 h-10",
                                        children: ((_party_host_profile = party.host_profile) === null || _party_host_profile === void 0 ? void 0 : _party_host_profile.avatar_url) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: party.host_profile.avatar_url,
                                            alt: "Host avatar",
                                            width: 40,
                                            height: 40,
                                            className: "w-full h-full object-cover rounded-full"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                            lineNumber: 109,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                            className: "bg-primary/20 text-primary font-semibold",
                                            children: ((_party_host_profile1 = party.host_profile) === null || _party_host_profile1 === void 0 ? void 0 : (_party_host_profile_nickname = _party_host_profile1.nickname) === null || _party_host_profile_nickname === void 0 ? void 0 : _party_host_profile_nickname.charAt(0).toUpperCase()) || ((_party_host_profile2 = party.host_profile) === null || _party_host_profile2 === void 0 ? void 0 : (_party_host_profile_full_name = _party_host_profile2.full_name) === null || _party_host_profile_full_name === void 0 ? void 0 : _party_host_profile_full_name.charAt(0).toUpperCase()) || 'H'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                            lineNumber: 117,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-semibold text-sm truncate",
                                                        children: ((_party_host_profile3 = party.host_profile) === null || _party_host_profile3 === void 0 ? void 0 : _party_host_profile3.nickname) || ((_party_host_profile4 = party.host_profile) === null || _party_host_profile4 === void 0 ? void 0 : _party_host_profile4.full_name) || 'Anonymous Host'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                        lineNumber: 125,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                        className: "w-4 h-4 text-primary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                        lineNumber: 130,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                lineNumber: 124,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Host"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                lineNumber: 132,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this),
                                    ((_party_host_profile5 = party.host_profile) === null || _party_host_profile5 === void 0 ? void 0 : _party_host_profile5.points) !== null && ((_party_host_profile6 = party.host_profile) === null || _party_host_profile6 === void 0 ? void 0 : _party_host_profile6.points) !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-primary font-medium",
                                        children: [
                                            party.host_profile.points,
                                            " pts"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 135,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    ...Array(2)
                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 p-3 animate-pulse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 bg-muted rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                lineNumber: 146,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-4 bg-muted rounded w-24"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-3 bg-muted rounded w-16"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                        lineNumber: 149,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                lineNumber: 147,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 145,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this) : !isHost && !party.user_is_member ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-6 text-muted-foreground",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        className: "w-8 h-8 mx-auto mb-2 opacity-50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        children: "Join this party to see the member list"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this) : members.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-6 text-muted-foreground",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        className: "w-8 h-8 mx-auto mb-2 opacity-50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        children: "No other members yet"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this) : members.map((member)=>{
                                var _member_profile, _member_profile1, _member_profile2;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "w-10 h-10",
                                            children: ((_member_profile = member.profile) === null || _member_profile === void 0 ? void 0 : _member_profile.avatar_url) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: member.profile.avatar_url,
                                                alt: "Member avatar",
                                                width: 40,
                                                height: 40,
                                                className: "w-full h-full object-cover rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                lineNumber: 169,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                className: "bg-secondary/20 text-secondary-foreground font-semibold",
                                                children: getInitials(member)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                lineNumber: 177,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                            lineNumber: 167,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-medium text-sm truncate",
                                                    children: getDisplayName(member)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: [
                                                        "Joined ",
                                                        formatJoinTime(member.joined_at)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                                    lineNumber: 186,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                            lineNumber: 182,
                                            columnNumber: 17
                                        }, this),
                                        ((_member_profile1 = member.profile) === null || _member_profile1 === void 0 ? void 0 : _member_profile1.points) !== null && ((_member_profile2 = member.profile) === null || _member_profile2 === void 0 ? void 0 : _member_profile2.points) !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-primary font-medium",
                                            children: [
                                                member.profile.points,
                                                " pts"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                            lineNumber: 191,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, member.id, true, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                                    lineNumber: 166,
                                    columnNumber: 15
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_s(PartyMembersDialog, "Wti8zfxOA1p8MipVPugUKyQcG3I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = PartyMembersDialog;
var _c;
__turbopack_context__.k.register(_c, "PartyMembersDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>DashboardPartyCard
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell-off.js [app-client] (ecmascript) <export default as BellOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/authStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dashboardDataStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/services/partyMemberService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$PartyMembersDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/PartyMembersDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Dynamically import RideMap to avoid SSR issues
const RideMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/src/components/RideMap.tsx [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/RideMap.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = RideMap;
const EXPIRY_OPTIONS = [
    {
        label: "10 min",
        minutes: 10
    },
    {
        label: "15 min",
        minutes: 15
    },
    {
        label: "20 min",
        minutes: 20
    },
    {
        label: "30 min",
        minutes: 30
    },
    {
        label: "1 hr",
        minutes: 60
    }
];
// Helper function to format remaining time as MM:SS
const formatTimeLeft = (ms)=>{
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return "".concat(String(minutes).padStart(2, '0'), ":").concat(String(seconds).padStart(2, '0'));
};
function DashboardPartyCard(param) {
    let { party } = param;
    var _party_host_profile, _party_host_profile1, _party_host_profile2, _party_host_profile3, _party_host_profile4;
    _s();
    const refreshParties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "DashboardPartyCard.useDashboardDataStore[refreshParties]": (state)=>state.refreshParties
    }["DashboardPartyCard.useDashboardDataStore[refreshParties]"]);
    const [editingExpiry, setEditingExpiry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newExpiryMinutes, setNewExpiryMinutes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [updatingExpiry, setUpdatingExpiry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showProfileDialog, setShowProfileDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Update expiry handler
    const handleUpdateExpiry = async ()=>{
        if (!newExpiryMinutes || !user) return;
        setUpdatingExpiry(true);
        try {
            const newExpiryTimestamp = new Date(Date.now() + newExpiryMinutes * 60_000).toISOString();
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { error } = await supabase.from('parties').update({
                duration_minutes: newExpiryMinutes,
                expires_at: newExpiryTimestamp
            }).eq('id', party.id).eq('host_id', user.id);
            if (error) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to update expiry');
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Expiry updated!');
                setEditingExpiry(false);
                setNewExpiryMinutes(null);
                await refreshParties();
            }
        } catch (e) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Unexpected error updating expiry');
        } finally{
            setUpdatingExpiry(false);
        }
    };
    // Helper to get the base URL (works for both dev and prod)
    const getBaseUrl = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            return window.location.origin;
        }
        //TURBOPACK unreachable
        ;
    };
    // Share handler
    const handleShareParty = async ()=>{
        const shareUrl = "".concat(getBaseUrl(), "/party/").concat(party.id);
        const shareText = "Join my party on Meet Riders!\n".concat(shareUrl);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my party on Meet Riders!',
                    text: 'Check out this party I created. Click to join!',
                    url: shareUrl
                });
            } catch (err) {
            // User cancelled or error
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Party link copied to clipboard!');
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to copy link.');
            }
        } else {
            // fallback: prompt
            window.prompt('Copy this link:', shareUrl);
        }
    };
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const isHost = party.host_id === (user === null || user === void 0 ? void 0 : user.id);
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(party.expires_at.getTime() - Date.now());
    const [alertOn, setAlertOn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isJoining, setIsJoining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLeaving, setIsLeaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Overlay removed; redirect instead
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPartyCard.useEffect": ()=>{
            const timer = setInterval({
                "DashboardPartyCard.useEffect.timer": ()=>{
                    setTimeLeft(party.expires_at.getTime() - Date.now());
                }
            }["DashboardPartyCard.useEffect.timer"], 1000);
            return ({
                "DashboardPartyCard.useEffect": ()=>clearInterval(timer)
            })["DashboardPartyCard.useEffect"];
        }
    }["DashboardPartyCard.useEffect"], [
        party.expires_at
    ]);
    const isExpired = timeLeft <= 0 || !party.is_active;
    const handleJoinParty = async ()=>{
        if (!user || isHost || party.user_is_member) return;
        setIsJoining(true);
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["partyMemberService"].joinParty(party.id);
            if (result.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Joined party to ".concat(party.drop_off));
                router.push('/current-party');
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(result.error || 'Failed to join party');
            }
        } catch (error) {
            console.error('Error joining party:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Unexpected error while joining the party');
        } finally{
            setIsJoining(false);
        }
    };
    const handleLeaveParty = async ()=>{
        if (!user || !party.user_is_member) return;
        const confirmed = confirm('Are you sure you want to leave this party?');
        if (!confirmed) return;
        setIsLeaving(true);
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["partyMemberService"].leaveParty(party.id);
            if (result.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Left the party');
                // Trigger refresh of parties data
                await refreshParties();
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(result.error || 'Failed to leave party');
            }
        } catch (error) {
            console.error('Error leaving party:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Unexpected error while leaving the party');
        } finally{
            setIsLeaving(false);
        }
    };
    const handleCancelParty = async ()=>{
        if (!user || !isHost) return;
        const confirmed = confirm('Are you sure you want to cancel this party?');
        if (!confirmed) return;
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { error } = await supabase.from('parties').update({
                is_active: false
            }).eq('id', party.id).eq('host_id', user.id);
            if (error) {
                console.error('Error canceling party:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to cancel party');
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Party canceled');
                await refreshParties();
            }
        } catch (error) {
            console.error('Error canceling party:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to cancel party');
        }
    };
    const getRideOptionsDisplay = ()=>{
        if (!party.ride_options || party.ride_options.length === 0) {
            return 'Any ride';
        }
        return party.ride_options.join(', ');
    };
    const getHostDisplayName = ()=>{
        if (isHost) {
            return 'Your Party';
        }
        const profile = party.host_profile;
        if (!profile) {
            return 'Anonymous Host';
        }
        return profile.nickname || profile.full_name || 'Anonymous Host';
    };
    const getHostInitials = ()=>{
        if (isHost) {
            return 'ME';
        }
        const profile = party.host_profile;
        if (!profile) {
            return 'H';
        }
        const name = profile.nickname || profile.full_name;
        if (!name) {
            return 'H';
        }
        return name.split(' ').map((word)=>word.charAt(0).toUpperCase()).slice(0, 2).join('');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "transition-all rounded-lg duration-300 hover:shadow-lg relative overflow-hidden bg-card/60 backdrop-blur-[6.2px]",
        style: {
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: "hidden"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                lineNumber: 252,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3",
                children: [
                    showProfileDialog && party.host_profile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-card rounded-lg shadow-lg p-6 max-w-md w-full relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "absolute top-2 right-2 text-xl",
                                    onClick: ()=>setShowProfileDialog(false),
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                    lineNumber: 258,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "w-20 h-20",
                                            children: party.host_profile.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: party.host_profile.avatar_url,
                                                alt: "Host avatar",
                                                width: 80,
                                                height: 80,
                                                className: "w-full h-full object-cover rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 262,
                                                columnNumber: 41
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                className: "bg-primary/10 text-primary font-semibold text-2xl",
                                                children: getHostInitials()
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 264,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 260,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-bold mt-2",
                                            children: party.host_profile.nickname || party.host_profile.full_name || 'Anonymous Host'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 269,
                                            columnNumber: 33
                                        }, this),
                                        party.host_profile.university && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-muted-foreground",
                                            children: party.host_profile.university
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 271,
                                            columnNumber: 37
                                        }, this),
                                        party.host_profile.gender && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-muted-foreground",
                                            children: [
                                                "Gender: ",
                                                party.host_profile.gender
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 274,
                                            columnNumber: 37
                                        }, this),
                                        party.host_profile.points !== null && party.host_profile.points !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-muted-foreground",
                                            children: [
                                                "Points: ",
                                                party.host_profile.points
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 277,
                                            columnNumber: 37
                                        }, this),
                                        party.host_profile.bio && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-muted-foreground mt-2 text-center",
                                            children: party.host_profile.bio
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 280,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                    lineNumber: 259,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                            lineNumber: 257,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                        lineNumber: 256,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex lg:flex-col items-center lg:items-center gap-2 lg:gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowProfileDialog(true),
                                        className: "focus:outline-none flex-shrink-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "w-12 h-12 lg:w-14 lg:h-14",
                                            children: ((_party_host_profile = party.host_profile) === null || _party_host_profile === void 0 ? void 0 : _party_host_profile.avatar_url) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: party.host_profile.avatar_url,
                                                alt: "Host avatar",
                                                width: 56,
                                                height: 56,
                                                className: "w-full h-full object-cover rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 294,
                                                columnNumber: 37
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                className: "bg-primary/10 text-primary font-semibold text-sm",
                                                children: getHostInitials()
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 302,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 292,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 291,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 lg:flex-none lg:w-full text-left lg:text-center space-y-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex lg:flex-col items-center lg:items-center gap-1.5 lg:gap-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-bold text-sm truncate max-w-full",
                                                        children: getHostDisplayName()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 311,
                                                        columnNumber: 33
                                                    }, this),
                                                    isExpired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "bg-destructive/10 text-destructive px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap",
                                                        children: "EXPIRED"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 310,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[11px] text-muted-foreground space-y-0",
                                                children: [
                                                    ((_party_host_profile1 = party.host_profile) === null || _party_host_profile1 === void 0 ? void 0 : _party_host_profile1.gender) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "capitalize",
                                                        children: party.host_profile.gender
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 37
                                                    }, this),
                                                    ((_party_host_profile2 = party.host_profile) === null || _party_host_profile2 === void 0 ? void 0 : _party_host_profile2.points) !== null && ((_party_host_profile3 = party.host_profile) === null || _party_host_profile3 === void 0 ? void 0 : _party_host_profile3.points) !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-primary font-medium",
                                                        children: [
                                                            party.host_profile.points,
                                                            " pts"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 325,
                                                        columnNumber: 37
                                                    }, this),
                                                    ((_party_host_profile4 = party.host_profile) === null || _party_host_profile4 === void 0 ? void 0 : _party_host_profile4.university) && party.display_university && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1 lg:justify-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                className: "w-3 h-3 flex-shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 331,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs truncate",
                                                                children: party.host_profile.university
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 332,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 320,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 309,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                lineNumber: 290,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2.5 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col sm:flex-row gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0 bg-muted/30 rounded-lg p-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-start gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                            className: "w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 346,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0 text-xs space-y-0.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-baseline gap-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[11px] text-muted-foreground font-medium flex-shrink-0",
                                                                            children: "From:"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                            lineNumber: 349,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "truncate flex-1",
                                                                            children: party.meetup_point
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                            lineNumber: 350,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                    lineNumber: 348,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-baseline gap-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[11px] text-muted-foreground font-medium flex-shrink-0",
                                                                            children: "To:"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                            lineNumber: 353,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "truncate font-semibold flex-1",
                                                                            children: party.drop_off
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                            lineNumber: 354,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                    lineNumber: 352,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 347,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                    lineNumber: 345,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 344,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 sm:w-[90px] flex-shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-0.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-lg sm:text-xl font-bold text-primary tabular-nums",
                                                                children: isExpired ? '--:--' : formatTimeLeft(timeLeft)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 363,
                                                                columnNumber: 37
                                                            }, this),
                                                            isHost && !isExpired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "p-0.5 rounded hover:bg-accent/40 transition-colors",
                                                                title: "Edit expiry time",
                                                                onClick: ()=>setEditingExpiry((v)=>!v),
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                                                    className: "w-3 h-3 text-muted-foreground"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                    lineNumber: 372,
                                                                    columnNumber: 45
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 367,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 362,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[10px] text-muted-foreground whitespace-nowrap",
                                                        children: isExpired ? 'Ended' : 'Remaining'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 361,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 342,
                                        columnNumber: 25
                                    }, this),
                                    isHost && !isExpired && editingExpiry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "border rounded px-3 py-1.5 text-sm",
                                                value: newExpiryMinutes !== null && newExpiryMinutes !== void 0 ? newExpiryMinutes : "",
                                                onChange: (e)=>setNewExpiryMinutes(e.target.value ? Number(e.target.value) : null),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "Select new expiry"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 390,
                                                        columnNumber: 37
                                                    }, this),
                                                    EXPIRY_OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: opt.minutes,
                                                            children: opt.label
                                                        }, opt.minutes, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 392,
                                                            columnNumber: 41
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 385,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "sm",
                                                disabled: updatingExpiry || !newExpiryMinutes,
                                                onClick: handleUpdateExpiry,
                                                children: updatingExpiry ? 'Updating...' : 'Save'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 395,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "sm",
                                                variant: "ghost",
                                                onClick: ()=>setEditingExpiry(false),
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 398,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 384,
                                        columnNumber: 29
                                    }, this),
                                    party.start_coords && party.dest_coords && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg overflow-hidden",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RideMap, {
                                            start: party.start_coords,
                                            dest: party.dest_coords,
                                            height: 140
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                            lineNumber: 405,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 404,
                                        columnNumber: 29
                                    }, this),
                                    party.user_is_member && party.host_comments && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 bg-accent/40 rounded-lg border border-accent",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-semibold text-[11px] mb-0.5",
                                                children: "Host Comments"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 412,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs whitespace-pre-line",
                                                children: party.host_comments
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 413,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 411,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$PartyMembersDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        party: party,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "flex items-center gap-1 hover:text-primary transition-colors",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                    className: "w-3.5 h-3.5 text-muted-foreground"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                    lineNumber: 422,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: [
                                                                        (party.current_member_count || 0) + 1,
                                                                        "/",
                                                                        party.party_size
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                    lineNumber: 423,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 421,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 430,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[11px]",
                                                                children: getRideOptionsDisplay()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 431,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 429,
                                                        columnNumber: 33
                                                    }, this),
                                                    party.is_friends_only && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-accent/70 px-1.5 py-0.5 rounded text-[10px] font-medium",
                                                        children: "🔒 Connections"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 419,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1.5",
                                                children: isHost ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "destructive",
                                                            size: "sm",
                                                            onClick: handleCancelParty,
                                                            className: "h-8 text-xs",
                                                            children: "Cancel Party"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 445,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            className: "h-8 px-2",
                                                            onClick: handleShareParty,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 454,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 453,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        party.user_is_member ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            onClick: handleLeaveParty,
                                                            disabled: isLeaving,
                                                            className: "h-8 text-xs",
                                                            children: isLeaving ? 'Leaving...' : 'Leave Party'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 460,
                                                            columnNumber: 45
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            size: "sm",
                                                            onClick: handleJoinParty,
                                                            disabled: isExpired || isJoining || (party.current_member_count || 0) >= party.party_size,
                                                            className: "h-8 text-xs",
                                                            variant: isExpired || (party.current_member_count || 0) >= party.party_size ? "outline" : "default",
                                                            children: isJoining ? 'Joining...' : isExpired ? 'Expired' : (party.current_member_count || 0) >= party.party_size ? 'Full' : 'Join Party'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 470,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            onClick: ()=>setAlertOn(!alertOn),
                                                            className: "h-8 px-2",
                                                            children: alertOn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__["BellOff"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 493,
                                                                columnNumber: 56
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                                lineNumber: 493,
                                                                columnNumber: 94
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                            lineNumber: 487,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                                lineNumber: 442,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                        lineNumber: 418,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                                lineNumber: 340,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                        lineNumber: 288,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
                lineNumber: 253,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx",
        lineNumber: 247,
        columnNumber: 9
    }, this);
}
_s(DashboardPartyCard, "rXNvTg+wTa9Nae05vLvpz+ENWQs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = DashboardPartyCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "RideMap");
__turbopack_context__.k.register(_c1, "DashboardPartyCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/hooks/useDashboard.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useDashboard": ()=>useDashboard,
    "useDashboardParties": ()=>useDashboardParties
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/authStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dashboardFiltersStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dashboardDataStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const TIME_WINDOW_ANY = "any";
function useDashboard() {
    _s();
    const { user, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const refreshProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboard.useDashboardDataStore[refreshProfile]": (state)=>state.refreshProfile
    }["useDashboard.useDashboardDataStore[refreshProfile]"]);
    const refreshParties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboard.useDashboardDataStore[refreshParties]": (state)=>state.refreshParties
    }["useDashboard.useDashboardDataStore[refreshParties]"]);
    const resetDashboard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboard.useDashboardDataStore[resetDashboard]": (state)=>state.reset
    }["useDashboard.useDashboardDataStore[resetDashboard]"]);
    const welcomeName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboard.useDashboardDataStore[welcomeName]": (state)=>state.welcomeName
    }["useDashboard.useDashboardDataStore[welcomeName]"]);
    const isCheckingProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboard.useDashboardDataStore[isCheckingProfile]": (state)=>state.isCheckingProfile
    }["useDashboard.useDashboardDataStore[isCheckingProfile]"]);
    const partiesLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboard.useDashboardDataStore[partiesLoading]": (state)=>state.partiesLoading
    }["useDashboard.useDashboardDataStore[partiesLoading]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDashboard.useEffect": ()=>{
            if (loading) return;
            if (!user) {
                resetDashboard();
                router.push("/login");
                return;
            }
            let cancelled = false;
            ({
                "useDashboard.useEffect": async ()=>{
                    const profileStatus = await refreshProfile();
                    if (cancelled) return;
                    if (profileStatus === "needs-onboarding") {
                        router.push("/user-create");
                        return;
                    }
                    if (profileStatus === "error") {
                        router.push("/login");
                        return;
                    }
                    if (profileStatus === "ok") {
                        await refreshParties();
                    }
                }
            })["useDashboard.useEffect"]();
            return ({
                "useDashboard.useEffect": ()=>{
                    cancelled = true;
                }
            })["useDashboard.useEffect"];
        }
    }["useDashboard.useEffect"], [
        loading,
        user,
        refreshProfile,
        refreshParties,
        router,
        resetDashboard
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDashboard.useEffect": ()=>{
            if (!user || loading) return;
            const interval = setInterval({
                "useDashboard.useEffect.interval": ()=>{
                    refreshParties();
                }
            }["useDashboard.useEffect.interval"], 30000);
            return ({
                "useDashboard.useEffect": ()=>clearInterval(interval)
            })["useDashboard.useEffect"];
        }
    }["useDashboard.useEffect"], [
        user,
        loading,
        refreshParties
    ]);
    const isLoading = loading || isCheckingProfile || partiesLoading;
    return {
        welcomeName,
        isLoading
    };
}
_s(useDashboard, "im7t5h9Yk6/1y6nVs4FdjKvqzNE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
function useDashboardParties() {
    _s1();
    const parties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardDataStore[parties]": (state)=>state.parties
    }["useDashboardParties.useDashboardDataStore[parties]"]);
    const viewerUniversity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardDataStore[viewerUniversity]": (state)=>state.viewerUniversity
    }["useDashboardParties.useDashboardDataStore[viewerUniversity]"]);
    const partiesLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardDataStore[partiesLoading]": (state)=>state.partiesLoading
    }["useDashboardParties.useDashboardDataStore[partiesLoading]"]);
    const destinationQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardFiltersStore[destinationQuery]": (state)=>state.destinationQuery
    }["useDashboardParties.useDashboardFiltersStore[destinationQuery]"]);
    const timeWindowMins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardFiltersStore[timeWindowMins]": (state)=>state.timeWindowMins
    }["useDashboardParties.useDashboardFiltersStore[timeWindowMins]"]);
    const showFriendsOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardFiltersStore[showFriendsOnly]": (state)=>state.showFriendsOnly
    }["useDashboardParties.useDashboardFiltersStore[showFriendsOnly]"]);
    const showMyUniversityOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useDashboardParties.useDashboardFiltersStore[showMyUniversityOnly]": (state)=>state.showMyUniversityOnly
    }["useDashboardParties.useDashboardFiltersStore[showMyUniversityOnly]"]);
    const filteredParties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardParties.useMemo[filteredParties]": ()=>{
            return filterParties(parties, {
                destinationQuery,
                timeWindowMins,
                showFriendsOnly,
                showMyUniversityOnly
            }, viewerUniversity);
        }
    }["useDashboardParties.useMemo[filteredParties]"], [
        parties,
        destinationQuery,
        timeWindowMins,
        showFriendsOnly,
        showMyUniversityOnly,
        viewerUniversity
    ]);
    const orderedParties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardParties.useMemo[orderedParties]": ()=>{
            return orderParties(filteredParties, viewerUniversity);
        }
    }["useDashboardParties.useMemo[orderedParties]"], [
        filteredParties,
        viewerUniversity
    ]);
    return {
        filteredParties,
        orderedParties,
        partiesLoading
    };
}
_s1(useDashboardParties, "9oxvH/V0ckEKffWpwvJwSK2O0VI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardDataStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dashboardFiltersStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
function filterParties(parties, filters, viewerUniversity) {
    const query = filters.destinationQuery.trim().toLowerCase();
    const maxMs = filters.timeWindowMins === TIME_WINDOW_ANY ? Infinity : parseInt(filters.timeWindowMins, 10) * 60_000;
    const now = Date.now();
    return parties.filter((party)=>{
        const matchesDestination = query === "" || party.drop_off.toLowerCase().includes(query) || party.meetup_point.toLowerCase().includes(query);
        const timeLeft = party.expires_at.getTime() - now;
        const matchesTime = maxMs === Infinity || timeLeft > 0 && timeLeft <= maxMs;
        const matchesFriends = !filters.showFriendsOnly || party.is_friends_only;
        const matchesUniversity = !filters.showMyUniversityOnly || viewerUniversity && party.host_university === viewerUniversity;
        return matchesDestination && matchesTime && matchesFriends && matchesUniversity;
    });
}
function orderParties(filteredParties, viewerUniversity) {
    const friends = [];
    const sameUniversity = [];
    const others = [];
    for (const party of filteredParties){
        if (party.is_friends_only) {
            friends.push(party);
            continue;
        }
        const sameSchool = Boolean(viewerUniversity && party.host_university && party.display_university && party.host_university === viewerUniversity);
        if (sameSchool) {
            sameUniversity.push(party);
        } else {
            others.push(party);
        }
    }
    return [
        ...friends,
        ...sameUniversity,
        ...others
    ];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/RidesList.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>RidesList
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$DashboardPartyCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/DashboardPartyCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$hooks$2f$useDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/hooks/useDashboard.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RidesList() {
    _s();
    const { orderedParties, partiesLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$hooks$2f$useDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardParties"])();
    if (partiesLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-card p-6 rounded-lg shadow-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-semibold text-card-foreground mb-4",
                    children: "Available Rides"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
                    children: [
                        ...Array(3)
                    ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-pulse",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-32 bg-card/60 backdrop-blur-[6.2px] rounded-lg",
                                style: {
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                                lineNumber: 17,
                                columnNumber: 15
                            }, this)
                        }, i, false, {
                            fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                            lineNumber: 16,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                    lineNumber: 14,
                    columnNumber: 3
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this);
    }
    // Filter out expired parties
    const now = Date.now();
    const activeParties = orderedParties.filter((party)=>party.expires_at && party.expires_at.getTime() > now);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: " relative z-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-semibold text-card-foreground mb-4",
                children: "Available Rides"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            activeParties.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EmptyRidesState, {}, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-4",
                children: activeParties.map((party)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$DashboardPartyCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        party: party
                    }, party.id, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                        lineNumber: 44,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_s(RidesList, "9RDxcP2Uawxe2vRktrJIeuL/+XI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$hooks$2f$useDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardParties"]
    ];
});
_c = RidesList;
function EmptyRidesState() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center py-10 border-2 border-dashed border-border rounded-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground mb-4",
                children: "No rides match your filters right now."
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/hostparty",
                className: "inline-block px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 shadow",
                children: "Host a Ride"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/RidesList.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_c1 = EmptyRidesState;
var _c, _c1;
__turbopack_context__.k.register(_c, "RidesList");
__turbopack_context__.k.register(_c1, "EmptyRidesState");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/LoadingScreen.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>LoadingScreen
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function LoadingScreen(param) {
    let { message = "Loading your dashboard..." } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center min-h-screen",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/dashboard/components/LoadingScreen.tsx",
                    lineNumber: 9,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl text-muted-foreground",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/dashboard/components/LoadingScreen.tsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/dashboard/components/LoadingScreen.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/dashboard/components/LoadingScreen.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = LoadingScreen;
var _c;
__turbopack_context__.k.register(_c, "LoadingScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/services/soiMemberService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "SoiMemberService": ()=>SoiMemberService,
    "soiMemberService": ()=>soiMemberService
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
;
;
class SoiMemberService {
    async join(soiId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: "Not authenticated"
            };
            const { data: member, error } = await this.supabase.from('soi_members').insert({
                soi_id: soiId,
                user_id: user.id,
                status: 'joined'
            }).select("*, profile:user_id ( id, full_name, nickname, avatar_url, gender, points, university, show_university )").single();
            if (error) return {
                success: false,
                error: error.message
            };
            const transformed = {
                ...member,
                joined_at: new Date(member.joined_at),
                left_at: member.left_at ? new Date(member.left_at) : undefined,
                created_at: member.created_at ? new Date(member.created_at) : undefined,
                updated_at: member.updated_at ? new Date(member.updated_at) : undefined
            };
            return {
                success: true,
                member: transformed
            };
        } catch (e) {
            return {
                success: false,
                error: (e === null || e === void 0 ? void 0 : e.message) || 'Join failed'
            };
        }
    }
    async leave(soiId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: "Not authenticated"
            };
            const { error } = await this.supabase.from('soi_members').update({
                status: 'left',
                left_at: new Date().toISOString()
            }).eq('soi_id', soiId).eq('user_id', user.id).eq('status', 'joined');
            if (error) return {
                success: false,
                error: error.message
            };
            return {
                success: true
            };
        } catch (e) {
            return {
                success: false,
                error: (e === null || e === void 0 ? void 0 : e.message) || 'Leave failed'
            };
        }
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "supabase", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])());
    }
}
const soiMemberService = new SoiMemberService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/services/soiPartyService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "SoiPartyService": ()=>SoiPartyService,
    "soiPartyService": ()=>soiPartyService
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
;
;
class SoiPartyService {
    async cancel(soiId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: "Not authenticated"
            };
            const { error } = await this.supabase.from('soi_parties').update({
                is_active: false
            }).eq('id', soiId).eq('host_id', user.id).eq('is_active', true);
            if (error) return {
                success: false,
                error: error.message
            };
            return {
                success: true
            };
        } catch (e) {
            return {
                success: false,
                error: (e === null || e === void 0 ? void 0 : e.message) || 'Cancel failed'
            };
        }
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "supabase", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])());
    }
}
const soiPartyService = new SoiPartyService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/components/SoiList.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>SoiList
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$soiMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/services/soiMemberService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$soiPartyService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/services/soiPartyService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function formatCountdown(target) {
    if (!target) return "";
    const now = new Date().getTime();
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) return "starting now";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return "".concat(mins, "m");
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return "".concat(hrs, "h ").concat(rem, "m");
}
function SoiList() {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Date.now());
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SoiList.useEffect": ()=>{
            const id = setInterval({
                "SoiList.useEffect.id": ()=>setNow(Date.now())
            }["SoiList.useEffect.id"], 30_000);
            return ({
                "SoiList.useEffect": ()=>clearInterval(id)
            })["SoiList.useEffect"];
        }
    }["SoiList.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SoiList.useEffect": ()=>{
            ({
                "SoiList.useEffect": async ()=>{
                    const { data: { user } } = await supabase.auth.getUser();
                    var _user_id;
                    setUserId((_user_id = user === null || user === void 0 ? void 0 : user.id) !== null && _user_id !== void 0 ? _user_id : null);
                }
            })["SoiList.useEffect"]();
        }
    }["SoiList.useEffect"], [
        supabase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SoiList.useEffect": ()=>{
            const fetchSOIs = {
                "SoiList.useEffect.fetchSOIs": async ()=>{
                    setLoading(true);
                    setError(null);
                    // active SOIs that haven't started more than 10 minutes ago
                    const { data, error } = await supabase.from("soi_parties").select("*").eq("is_active", true).gte("start_time", new Date(Date.now() - 10 * 60 * 1000).toISOString()).order("start_time", {
                        ascending: true
                    });
                    if (error) {
                        setError(error.message);
                        setLoading(false);
                        return;
                    }
                    const list = (data || []).map({
                        "SoiList.useEffect.fetchSOIs.list": (r)=>({
                                id: r.id,
                                created_at: new Date(r.created_at),
                                host_id: r.host_id,
                                party_size: r.party_size,
                                meetup_point: r.meetup_point,
                                drop_off: r.drop_off,
                                ride_options: r.ride_options || [],
                                start_time: new Date(r.start_time),
                                expiry_timestamp: r.expiry_timestamp ? new Date(r.expiry_timestamp) : null,
                                host_university: r.host_university,
                                display_university: Boolean(r.display_university),
                                is_active: r.is_active
                            })
                    }["SoiList.useEffect.fetchSOIs.list"]);
                    // fetch member counts via RPC and add +1 for host
                    const withCounts = await Promise.all(list.map({
                        "SoiList.useEffect.fetchSOIs": async (item)=>{
                            try {
                                const { data: countData, error: countErr } = await supabase.rpc('get_soi_member_count', {
                                    p_soi_id: item.id
                                });
                                var _countData_count;
                                const count = typeof countData === 'number' ? countData : (_countData_count = countData === null || countData === void 0 ? void 0 : countData.count) !== null && _countData_count !== void 0 ? _countData_count : 0;
                                return {
                                    ...item,
                                    current_member_count: (count || 0) + 1
                                };
                            } catch (e) {
                                return {
                                    ...item,
                                    current_member_count: 1
                                };
                            }
                        }
                    }["SoiList.useEffect.fetchSOIs"]));
                    setItems(withCounts);
                    setLoading(false);
                }
            }["SoiList.useEffect.fetchSOIs"];
            fetchSOIs();
        }
    }["SoiList.useEffect"], [
        supabase
    ]);
    const handleJoin = async (id)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$soiMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soiMemberService"].join(id);
        if (!res.success) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(res.error || 'Failed to join');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Joined');
        // refresh list
        const idx = items.findIndex((x)=>x.id === id);
        if (idx >= 0) {
            const updated = [
                ...items
            ];
            updated[idx] = {
                ...updated[idx],
                current_member_count: (updated[idx].current_member_count || 0) + 1
            };
            setItems(updated);
        }
    };
    const handleLeave = async (id)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$soiMemberService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soiMemberService"].leave(id);
        if (!res.success) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(res.error || 'Failed to leave');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Left');
        const idx = items.findIndex((x)=>x.id === id);
        if (idx >= 0) {
            const updated = [
                ...items
            ];
            updated[idx] = {
                ...updated[idx],
                current_member_count: Math.max(0, (updated[idx].current_member_count || 0) - 1)
            };
            setItems(updated);
        }
    };
    const handleCancel = async (id)=>{
        if (!confirm('Cancel this SOI? This will close it for everyone.')) return;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$soiPartyService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soiPartyService"].cancel(id);
        if (!res.success) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(res.error || 'Failed to cancel SOI');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('SOI canceled');
        setItems((prev)=>prev.filter((x)=>x.id !== id));
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-sm text-muted-foreground",
        children: "Loading upcoming rides…"
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
        lineNumber: 127,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-sm text-destructive",
        children: error
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
        lineNumber: 128,
        columnNumber: 21
    }, this);
    if (!items.length) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-sm text-muted-foreground",
        children: "No upcoming rides."
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
        lineNumber: 129,
        columnNumber: 29
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6",
        children: items.map((s)=>{
            const full = (s.current_member_count || 0) >= s.party_size;
            const countdown = formatCountdown(s.start_time);
            const isHost = userId && userId === s.host_id;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card border rounded-lg p-4 flex flex-col gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-semibold text-card-foreground",
                                children: s.meetup_point
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-muted-foreground",
                                children: [
                                    "Starts in ",
                                    countdown
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                                lineNumber: 141,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                        lineNumber: 139,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-muted-foreground",
                        children: [
                            "→ ",
                            s.drop_off
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                        lineNumber: 143,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-muted-foreground",
                        children: (s.ride_options || []).join(", ")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                        lineNumber: 144,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm",
                        children: [
                            s.current_member_count,
                            "/",
                            s.party_size,
                            " interested"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                        lineNumber: 145,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex gap-3",
                        children: isHost ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "px-4 py-2 rounded-md text-sm border border-destructive text-destructive hover:bg-destructive/10",
                            onClick: ()=>handleCancel(s.id),
                            children: "Cancel SOI"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                            lineNumber: 148,
                            columnNumber: 17
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-2 rounded-md text-sm ".concat(full ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'),
                                    disabled: full,
                                    onClick: ()=>handleJoin(s.id),
                                    children: "I'm in"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                                    lineNumber: 156,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-2 rounded-md text-sm border hover:bg-accent",
                                    onClick: ()=>handleLeave(s.id),
                                    children: "Change my mind"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                                    lineNumber: 163,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                        lineNumber: 146,
                        columnNumber: 13
                    }, this)
                ]
            }, s.id, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
                lineNumber: 138,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/dashboard/components/SoiList.tsx",
        lineNumber: 132,
        columnNumber: 5
    }, this);
}
_s(SoiList, "DL/RwdoXUH18Cmtk1knyvh+K2wU=");
_c = SoiList;
var _c;
__turbopack_context__.k.register(_c, "SoiList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/dashboard/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>HomePage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$hostbutton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/hostbutton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$DashboardHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/DashboardHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$RidesList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/RidesList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$LoadingScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/LoadingScreen.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$SoiList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/SoiList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$hooks$2f$useDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/hooks/useDashboard.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function HomePage() {
    _s();
    const { welcomeName, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$hooks$2f$useDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboard"])();
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$LoadingScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/dashboard/page.tsx",
            lineNumber: 14,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: " min-h-dvh p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$hostbutton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$DashboardHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                welcomeName: welcomeName
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 space-y-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$RidesList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-semibold text-card-foreground mb-4",
                                children: "Upcoming Rides (SOI)"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$SoiList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/page.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/page.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(HomePage, "1L4PiLOqE7ndBZjzT/DKcWeaA2Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$hooks$2f$useDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboard"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_371d4c36._.js.map