(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/public/red-pin.png (static in ecmascript)": ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/red-pin.d7088388.png");}),
"[project]/src/public/red-pin.png.mjs { IMAGE => \"[project]/src/public/red-pin.png (static in ecmascript)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/public/red-pin.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 512,
    height: 512,
    blurWidth: 8,
    blurHeight: 8,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAiUlEQVR42p2KMQ5FQBRFh2kHP/gb+L7ERBAJEp3CFqgtTaMTK6DUiR1oFTbBvAkiEY2Te5OX8y5CDJEl/2rFGLjL4NtLpquFyPWOgvGncWg/p8k6he5a038P7hxIGMuVZXRT5PFBZf06wtw5EFhimSQlNVso3ALXF0DoimZDb88DIqkGFD3xarAB4TQdmR2CGAkAAAAASUVORK5CYII="
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/RideMap.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>RideMap
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polyline.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/public/red-pin.png.mjs { IMAGE => "[project]/src/public/red-pin.png (static in ecmascript)" } [app-client] (structured image object, ecmascript)');
;
;
;
;
;
// Custom icons for start and destination
const startIcon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].icon({
    iconUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"].src,
    iconSize: [
        25,
        41
    ],
    iconAnchor: [
        12,
        41
    ],
    popupAnchor: [
        1,
        -34
    ],
    shadowSize: [
        41,
        41
    ]
});
const destIcon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].icon({
    iconUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$public$2f$red$2d$pin$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"].src,
    iconSize: [
        25,
        41
    ],
    iconAnchor: [
        12,
        41
    ],
    popupAnchor: [
        1,
        -34
    ],
    shadowSize: [
        41,
        41
    ]
});
const BENGALURU_CENTER = {
    lat: 12.9716,
    lng: 77.5946
};
const BENGALURU_BOUNDS = [
    [
        12.8,
        77.4
    ],
    [
        13.1,
        77.8
    ]
];
function toPoint(p) {
    if (!p) return null;
    const lat = typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
    const lng = typeof p.lng === "string" ? parseFloat(p.lng) : p.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
        lat,
        lng
    };
}
function RideMap(param) {
    let { start, dest, height = 300 } = param;
    // Only render the map if both start and dest are valid
    const s = toPoint(start);
    const d = toPoint(dest);
    if (!s || !d) return null;
    const center = {
        lat: (s.lat + d.lat) / 2,
        lng: (s.lng + d.lng) / 2
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100%",
            height
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
            center: center,
            zoom: 13,
            style: {
                width: "100%",
                height: "100%",
                borderRadius: 12
            },
            maxBounds: BENGALURU_BOUNDS,
            minZoom: 11,
            maxZoom: 18,
            scrollWheelZoom: false,
            dragging: true,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                    attribution: '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: s,
                    icon: startIcon
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: d,
                    icon: destIcon
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                    positions: [
                        [
                            s.lat,
                            s.lng
                        ],
                        [
                            d.lat,
                            d.lng
                        ]
                    ],
                    color: "blue"
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RideMap.tsx",
            lineNumber: 56,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/RideMap.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_c = RideMap;
var _c;
__turbopack_context__.k.register(_c, "RideMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/RideMap.tsx [app-client] (ecmascript, next/dynamic entry)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/RideMap.tsx [app-client] (ecmascript)"));
}),
}]);

//# sourceMappingURL=src_97f3d29d._.js.map