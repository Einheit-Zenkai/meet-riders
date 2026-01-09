(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

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
;
;
;
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
    let { start, dest, height = 300, isReadOnly = false } = param;
    const s = toPoint(start);
    const d = toPoint(dest);
    if (!s || !d) return null;
    function clampToBounds(point) {
        const clampedLat = Math.max(BENGALURU_BOUNDS[0][0], Math.min(BENGALURU_BOUNDS[1][0], point.lat));
        const clampedLng = Math.max(BENGALURU_BOUNDS[0][1], Math.min(BENGALURU_BOUNDS[1][1], point.lng));
        return {
            lat: clampedLat,
            lng: clampedLng
        };
    }
    const center = clampToBounds({
        lat: (s.lat + d.lat) / 2,
        lng: (s.lng + d.lng) / 2
    });
    console.log("Start Point:", s);
    console.log("Destination Point:", d);
    console.log("Calculated Center:", center);
    console.log("Bangalore Bounds:", BENGALURU_BOUNDS);
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
            scrollWheelZoom: !isReadOnly,
            dragging: !isReadOnly,
            maxBoundsViscosity: 1.0,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                    attribution: '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: s,
                    icon: new window.L.DivIcon({
                        html: "<img src='/assets/RedIcon.png' style='width:25px;height:41px;' alt='Start Icon' />",
                        className: "custom-marker"
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: d,
                    icon: new window.L.DivIcon({
                        html: "<img src='/assets/GreenIcon.png' style='width:25px;height:41px;' alt='Destination Icon' />",
                        className: "custom-marker"
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/RideMap.tsx",
                    lineNumber: 81,
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
                    lineNumber: 88,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RideMap.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/RideMap.tsx",
        lineNumber: 58,
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

//# sourceMappingURL=src_components_RideMap_tsx_0840a7ea._.js.map