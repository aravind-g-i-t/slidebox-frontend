import { useRef, useEffect, useState, useCallback } from "react";

interface CropRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface EditorState {
    rotation: number;   
    flipH: boolean;
    flipV: boolean;
    brightness: number; 
    contrast: number; 
}

interface DragState {
    type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;
    startX: number;
    startY: number;
    startCrop: CropRect;
}

interface ImageEditorProps {
    src: string;
    onSave: (file: File) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const HANDLE_SIZE = 10;
const MIN_CROP = 30;

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}


function getHandleRects({ x, y, w, h }: CropRect) {
    return [
        { type: "nw" as const, hx: x,         hy: y },
        { type: "ne" as const, hx: x + w,     hy: y },
        { type: "sw" as const, hx: x,         hy: y + h },
        { type: "se" as const, hx: x + w,     hy: y + h },
        { type: "n"  as const, hx: x + w / 2, hy: y },
        { type: "s"  as const, hx: x + w / 2, hy: y + h },
        { type: "w"  as const, hx: x,         hy: y + h / 2 },
        { type: "e"  as const, hx: x + w,     hy: y + h / 2 },
    ];
}

function hitTest(mx: number, my: number, c: CropRect): DragState["type"] {
    for (const { type, hx, hy } of getHandleRects(c)) {
        if (Math.abs(mx - hx) <= HANDLE_SIZE && Math.abs(my - hy) <= HANDLE_SIZE) return type;
    }
    if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) return "move";
    return null;
}

function getCanvasPos(
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
): { mx: number; my: number } {
    const rect = canvas.getBoundingClientRect();
    return {
        mx: (e.clientX - rect.left) * (canvas.width / rect.width),
        my: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
}


interface ToolBtnProps {
    onClick: () => void;
    title: string;
    active?: boolean;
    children: React.ReactNode;
}

function ToolBtn({ onClick, title, active, children }: ToolBtnProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-[0.85rem] transition-all border
                ${active
                    ? "bg-[#C1121F] border-[#C1121F] text-white"
                    : "bg-white border-[#E5E5E2] text-[#444] hover:border-[#C1121F] hover:text-[#C1121F]"
                }`}
        >
            {children}
        </button>
    );
}



export default function ImageEditor({ src, onSave, onCancel, isSaving }: ImageEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);


    const [canvasSize, setCanvasSize] = useState({ w: 600, h: 380 });

    const [state, setState] = useState<EditorState>({
        rotation: 0,
        flipH: false,
        flipV: false,
        brightness: 100,
        contrast: 100,
    });


    const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
    const [cropActive, setCropActive] = useState(false);
    const dragRef = useRef<DragState | null>(null);

    const [imgLoaded, setImgLoaded] = useState(false);



    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imgRef.current = img;
            setImgLoaded(true);
        };
        img.src = src;
    }, [src]);



    useEffect(() => {
        if (!imgLoaded || !containerRef.current) return;
        const img = imgRef.current!;
        const containerW = containerRef.current.clientWidth || 600;
        const containerH = 380;

        const isRotated90 = state.rotation % 180 !== 0;
        const srcW = isRotated90 ? img.naturalHeight : img.naturalWidth;
        const srcH = isRotated90 ? img.naturalWidth : img.naturalHeight;

        const scale = Math.min(containerW / srcW, containerH / srcH, 1);
        const w = Math.round(srcW * scale);
        const h = Math.round(srcH * scale);

        setCanvasSize({ w, h });

        setCrop({ x: 0, y: 0, w, h });
    }, [imgLoaded, state.rotation]);



    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !imgLoaded) return;

        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%)`;


        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((state.rotation * Math.PI) / 180);
        ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);

        const isRotated90 = state.rotation % 180 !== 0;
        const drawW = isRotated90 ? canvas.height : canvas.width;
        const drawH = isRotated90 ? canvas.width : canvas.height;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
        ctx.filter = "none";


        if (cropActive) {
            const { x, y, w, h } = crop;


            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(0, 0, canvas.width, y);
            ctx.fillRect(0, y + h, canvas.width, canvas.height - y - h);
            ctx.fillRect(0, y, x, h);
            ctx.fillRect(x + w, y, canvas.width - x - w, h);


            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, w, h);


            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 0.5;
            for (let i = 1; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x + (w / 3) * i, y);
                ctx.lineTo(x + (w / 3) * i, y + h);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y + (h / 3) * i);
                ctx.lineTo(x + w, y + (h / 3) * i);
                ctx.stroke();
            }


            const handles = getHandleRects({ x, y, w, h });
            ctx.fillStyle = "#ffffff";
            handles.forEach(({ hx, hy }) => {
                ctx.fillRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgLoaded, state, crop, cropActive, canvasSize]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!cropActive) return;
        const { mx, my } = getCanvasPos(e, canvasRef.current!);
        const type = hitTest(mx, my, crop);
        if (!type) return;
        dragRef.current = { type, startX: mx, startY: my, startCrop: { ...crop } };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!cropActive) return;


        const { mx, my } = getCanvasPos(e, canvasRef.current!);
        if (!dragRef.current) {
            const hit = hitTest(mx, my, crop);
            const cursors: Record<string, string> = {
                nw: "nw-resize", ne: "ne-resize", sw: "sw-resize", se: "se-resize",
                n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
                move: "move",
            };
            canvasRef.current!.style.cursor = hit ? cursors[hit] : "crosshair";
            return;
        }

        const { type, startX, startY, startCrop } = dragRef.current;
        if(!type) return;
        const dx = mx - startX;
        const dy = my - startY;
        const cw = canvasSize.w;
        const ch = canvasSize.h;

        setCrop(() => {
            let { x, y, w, h } = startCrop;
            if (type === "move") {
                x = clamp(x + dx, 0, cw - w);
                y = clamp(y + dy, 0, ch - h);
            } else {
                if (type.includes("e")) { w = clamp(w + dx, MIN_CROP, cw - x); }
                if (type.includes("s")) { h = clamp(h + dy, MIN_CROP, ch - y); }
                if (type.includes("w")) {
                    const newW = clamp(w - dx, MIN_CROP, x + w);
                    x = x + w - newW;
                    w = newW;
                }
                if (type.includes("n")) {
                    const newH = clamp(h - dy, MIN_CROP, y + h);
                    y = y + h - newH;
                    h = newH;
                }
            }
            return { x, y, w, h };
        });
    };

    const handleMouseUp = () => { dragRef.current = null; };



    const handleSave = () => {
        const img = imgRef.current!;
        if (!img) return;


        const isRotated90 = state.rotation % 180 !== 0;
        const srcW = isRotated90 ? img.naturalHeight : img.naturalWidth;
        const srcH = isRotated90 ? img.naturalWidth : img.naturalHeight;


        const scaleX = srcW / canvasSize.w;
        const scaleY = srcH / canvasSize.h;

        const outW = cropActive ? Math.round(crop.w * scaleX) : srcW;
        const outH = cropActive ? Math.round(crop.h * scaleY) : srcH;
        const offX = cropActive ? Math.round(crop.x * scaleX) : 0;
        const offY = cropActive ? Math.round(crop.y * scaleY) : 0;

        const offscreen = document.createElement("canvas");
        offscreen.width = outW;
        offscreen.height = outH;
        const ctx = offscreen.getContext("2d")!;

        ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%)`;
        ctx.save();
        ctx.translate(outW / 2 + (srcW / 2 - offX - outW / 2), outH / 2 + (srcH / 2 - offY - outH / 2));




        ctx.restore();
        ctx.filter = "none";


        const fullCanvas = document.createElement("canvas");
        fullCanvas.width = srcW;
        fullCanvas.height = srcH;
        const fCtx = fullCanvas.getContext("2d")!;
        fCtx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%)`;
        fCtx.save();
        fCtx.translate(srcW / 2, srcH / 2);
        fCtx.rotate((state.rotation * Math.PI) / 180);
        fCtx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
        const drawW2 = isRotated90 ? srcH : srcW;
        const drawH2 = isRotated90 ? srcW : srcH;
        fCtx.drawImage(img, -drawW2 / 2, -drawH2 / 2, drawW2, drawH2);
        fCtx.restore();


        ctx.drawImage(fullCanvas, offX, offY, outW, outH, 0, 0, outW, outH);

        offscreen.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], "edited-image.jpg", { type: "image/jpeg" });
            onSave(file);
        }, "image/jpeg", 0.92);
    };



    const rotate = (delta: number) =>
        setState((s) => ({ ...s, rotation: ((s.rotation + delta) % 360 + 360) % 360 }));

    const flip = (axis: "H" | "V") =>
        setState((s) => ({ ...s, [axis === "H" ? "flipH" : "flipV"]: !s[axis === "H" ? "flipH" : "flipV"] }));

    const resetCrop = () => {
        setCrop({ x: 0, y: 0, w: canvasSize.w, h: canvasSize.h });
        setCropActive(true);
    };

    return (
        <div className="flex flex-col gap-0">

            <div className="flex items-center gap-2 px-6 py-3 border-b border-[#EEECEA] bg-[#FAFAF9] flex-wrap">
                <span className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wide mr-1">Rotate</span>
                <ToolBtn onClick={() => rotate(-90)} title="Rotate left 90°">↺</ToolBtn>
                <ToolBtn onClick={() => rotate(90)}  title="Rotate right 90°">↻</ToolBtn>

                <div className="w-px h-5 bg-[#E5E5E2] mx-1" />

                <span className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wide mr-1">Flip</span>
                <ToolBtn onClick={() => flip("H")} title="Flip horizontal" active={state.flipH}>⇔</ToolBtn>
                <ToolBtn onClick={() => flip("V")} title="Flip vertical"   active={state.flipV}>⇕</ToolBtn>

                <div className="w-px h-5 bg-[#E5E5E2] mx-1" />

                <span className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wide mr-1">Crop</span>
                <ToolBtn onClick={() => ( cropActive ? setCropActive(false) : resetCrop() )} title="Toggle crop" active={cropActive}>
                    ⊡
                </ToolBtn>
                {cropActive && (
                    <button
                        onClick={() => { setCrop({ x: 0, y: 0, w: canvasSize.w, h: canvasSize.h }); }}
                        className="text-[0.75rem] text-[#C1121F] hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>


            <div
                ref={containerRef}
                className="relative bg-[#1a1a1a] flex items-center justify-center"
                style={{ minHeight: 320, maxHeight: 400 }}
            >
                {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={canvasSize.w}
                    height={canvasSize.h}
                    style={{ maxWidth: "100%", maxHeight: 400, display: imgLoaded ? "block" : "none", cursor: cropActive ? "crosshair" : "default" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>


            <div className="px-6 py-4 border-t border-[#EEECEA] flex flex-col gap-3 bg-[#FAFAF9]">
                <Slider
                    label="Brightness"
                    value={state.brightness}
                    min={0} max={200}
                    onChange={(v) => setState((s) => ({ ...s, brightness: v }))}
                    onReset={() => setState((s) => ({ ...s, brightness: 100 }))}
                />
                <Slider
                    label="Contrast"
                    value={state.contrast}
                    min={0} max={200}
                    onChange={(v) => setState((s) => ({ ...s, contrast: v }))}
                    onReset={() => setState((s) => ({ ...s, contrast: 100 }))}
                />
            </div>


            <div className="px-6 py-3.5 border-t border-[#EEECEA] flex items-center justify-end gap-2">
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#E5E5E2] bg-white text-[#666] hover:border-[#C1121F] hover:text-[#C1121F] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !imgLoaded}
                    className="px-4 h-9 rounded-lg text-[0.85rem] font-medium bg-[#C1121F] text-white hover:bg-[#A50F1A] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving && (
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    )}
                    {isSaving ? "Saving…" : "Save changes"}
                </button>
            </div>
        </div>
    );
}



function Slider({
    label, value, min, max, onChange, onReset,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
    onReset: () => void;
}) {
    const mid = (min + max) / 2;
    const isDefault = value === mid;

    return (
        <div className="flex items-center gap-3">
            <span className="text-[0.78rem] font-medium text-[#888] w-20 shrink-0">{label}</span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 accent-[#C1121F] h-1 cursor-pointer"
            />
            <span className="text-[0.75rem] text-[#aaa] w-8 text-right tabular-nums">
                {value > mid ? `+${value - mid}` : value - mid}
            </span>
            <button
                onClick={onReset}
                disabled={isDefault}
                title="Reset"
                className="text-[0.72rem] text-[#bbb] hover:text-[#C1121F] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                ↺
            </button>
        </div>
    );
}