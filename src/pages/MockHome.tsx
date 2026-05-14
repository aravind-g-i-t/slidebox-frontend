import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ImageItem {
    id: string;
    title: string;
    url: string;
    selected: boolean;
}

const MOCK_IMAGES: ImageItem[] = [
    { id: "1", title: "Mountain Sunrise", url: "https://picsum.photos/seed/a1/400/300", selected: false },
    { id: "2", title: "Ocean Breeze", url: "https://picsum.photos/seed/b2/400/300", selected: false },
    { id: "3", title: "Forest Trail", url: "https://picsum.photos/seed/c3/400/300", selected: false },
    { id: "4", title: "City Lights", url: "https://picsum.photos/seed/d4/400/300", selected: false },
    { id: "5", title: "Desert Dunes", url: "https://picsum.photos/seed/e5/400/300", selected: false },
    { id: "6", title: "Autumn Leaves", url: "https://picsum.photos/seed/f6/400/300", selected: false },
];

export default function MockHome() {
    const navigate = useNavigate();
    const [images, setImages] = useState<ImageItem[]>(MOCK_IMAGES);
    const [isRearranging, setIsRearranging] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [editModal, setEditModal] = useState<ImageItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editPreview, setEditPreview] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string; title: string }[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadFileRef = useRef<HTMLInputElement>(null);

    const selectedCount = images.filter((i) => i.selected).length;


    const toggleSelect = (id: string) => {
        if (!isRearranging) return;
        setImages((prev) => prev.map((img) => img.id === id ? { ...img, selected: !img.selected } : img));
    };

    const clearSelection = () => setImages((prev) => prev.map((i) => ({ ...i, selected: false })));



    const handleDragStart = (id: string) => setDraggingId(id);
    const handleDragEnter = (id: string) => setDragOverId(id);

    const handleDrop = (targetId: string) => {
        if (!draggingId || draggingId === targetId) return;
        setImages((prev) => {
            const arr = [...prev];
            const fromIdx = arr.findIndex((i) => i.id === draggingId);
            const toIdx = arr.findIndex((i) => i.id === targetId);
            const [moved] = arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, moved);
            return arr;
        });
        setDraggingId(null);
        setDragOverId(null);
    };

    const handleDragEnd = () => { setDraggingId(null); setDragOverId(null); };

    const addFilePreviews = (files: File[]) => {
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPendingFiles((prev) => [
                    ...prev,
                    { file, preview: ev.target?.result as string, title: file.name.replace(/\.[^.]+$/, "") },
                ]);
            };
            reader.readAsDataURL(file);
        });
    };


    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        addFilePreviews(files);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        addFilePreviews(files);
    };

    

    const updatePendingTitle = (index: number, title: string) => {
        setPendingFiles((prev) => prev.map((f, i) => i === index ? { ...f, title } : f));
    };

    const removePending = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUploadSubmit = () => {
        const newImgs: ImageItem[] = pendingFiles.map((f, i) => ({
            id: `${Date.now()}-${i}`,
            title: f.title || "Untitled",
            url: f.preview,
            selected: false,
        }));
        setImages((prev) => [...prev, ...newImgs]);
        setPendingFiles([]);
        setUploadModal(false);
    };



    const openEdit = (img: ImageItem) => {
        setEditModal(img);
        setEditTitle(img.title);
        setEditPreview(img.url);
    };

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setEditPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleEditSave = () => {
        if (!editModal) return;
        setImages((prev) =>
            prev.map((img) =>
                img.id === editModal.id ? { ...img, title: editTitle, url: editPreview } : img
            )
        );
        setEditModal(null);
    };


    const handleDelete = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setDeleteConfirm(null);
    };

    const handleDeleteSelected = () => {
        setImages((prev) => prev.filter((img) => !img.selected));
        setIsRearranging(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#FAFAF9", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* ── Navbar ── */
                .sb-nav {
                    background: #fff;
                    border-bottom: 1px solid #EEECEA;
                    padding: 0 2rem;
                    height: 62px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .sb-nav-logo {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.55rem;
                    font-weight: 700;
                    color: #C1121F;
                    letter-spacing: -0.3px;
                    display: flex;
                    align-items: center;
                }

                .sb-nav-logo-dot {
                    width: 7px;
                    height: 7px;
                    background: #C1121F;
                    border-radius: 50%;
                    margin-left: 3px;
                    margin-bottom: 12px;
                }

                .sb-nav-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .sb-avatar {
                    width: 36px;
                    height: 36px;
                    background: #C1121F;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* ── Buttons ── */
                .sb-btn {
                    padding: 0 16px;
                    height: 36px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    font-family: inherit;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.15s;
                    border: 1.5px solid transparent;
                    white-space: nowrap;
                }

                .sb-btn-primary {
                    background: #C1121F;
                    color: #fff;
                    border-color: #C1121F;
                }

                .sb-btn-primary:hover { background: #A50F1A; border-color: #A50F1A; }

                .sb-btn-outline {
                    background: #fff;
                    color: #444;
                    border-color: #E5E5E2;
                }

                .sb-btn-outline:hover { border-color: #C1121F; color: #C1121F; }

                .sb-btn-ghost {
                    background: transparent;
                    color: #888;
                    border-color: transparent;
                }

                .sb-btn-ghost:hover { background: #F5F4F2; color: #444; }

                .sb-btn-danger {
                    background: #FFF0F0;
                    color: #C1121F;
                    border-color: #FFCDD0;
                }

                .sb-btn-danger:hover { background: #C1121F; color: #fff; border-color: #C1121F; }

                /* ── Main layout ── */
                .sb-main { padding: 2rem; max-width: 1200px; margin: 0 auto; }

                /* ── Toolbar ── */
                .sb-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.75rem;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .sb-toolbar-left h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.3px;
                }

                .sb-toolbar-left p {
                    font-size: 0.85rem;
                    color: #aaa;
                    margin-top: 2px;
                }

                .sb-toolbar-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

                /* ── Rearrange banner ── */
                .sb-rearrange-banner {
                    background: #FFF8F8;
                    border: 1.5px solid #FFCDD0;
                    border-radius: 10px;
                    padding: 12px 18px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .sb-rearrange-banner p {
                    font-size: 0.88rem;
                    color: #C1121F;
                    font-weight: 500;
                }

                .sb-rearrange-banner span {
                    font-size: 0.83rem;
                    color: #E5A0A4;
                    font-weight: 400;
                }

                /* ── Gallery grid ── */
                .sb-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 18px;
                }

                /* ── Image card ── */
                .sb-card {
                    background: #fff;
                    border: 1.5px solid #EEECEA;
                    border-radius: 14px;
                    overflow: hidden;
                    transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
                    cursor: default;
                    position: relative;
                }

                .sb-card:hover { border-color: #E0DEDA; box-shadow: 0 4px 20px rgba(0,0,0,0.07); }

                .sb-card.selected {
                    border-color: #C1121F;
                    box-shadow: 0 0 0 3px rgba(193,18,31,0.12);
                }

                .sb-card.drag-over {
                    border-color: #C1121F;
                    transform: scale(1.02);
                }

                .sb-card.dragging {
                    opacity: 0.45;
                    transform: scale(0.97);
                }

                .sb-card-img-wrap {
                    position: relative;
                    aspect-ratio: 4/3;
                    overflow: hidden;
                    background: #F0EFED;
                }

                .sb-card-img-wrap img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.25s;
                }

                .sb-card:hover .sb-card-img-wrap img { transform: scale(1.04); }

                .sb-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0);
                    transition: background 0.2s;
                    display: flex;
                    align-items: flex-start;
                    justify-content: flex-end;
                    padding: 10px;
                    gap: 6px;
                }

                .sb-card:hover .sb-card-overlay { background: rgba(0,0,0,0.18); }

                .sb-card-action {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255,255,255,0.92);
                    color: #444;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 13px;
                    opacity: 0;
                    transition: opacity 0.18s, background 0.15s;
                }

                .sb-card:hover .sb-card-action { opacity: 1; }
                .sb-card-action:hover { background: #fff; }
                .sb-card-action.del:hover { background: #C1121F; color: #fff; }

                .sb-card-check {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.8);
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .sb-card-check.checked {
                    background: #C1121F;
                    border-color: #C1121F;
                }

                .sb-card-check.checked::after {
                    content: '';
                    width: 5px;
                    height: 9px;
                    border: 2px solid #fff;
                    border-top: none;
                    border-left: none;
                    transform: rotate(45deg) translate(-1px, -1px);
                    display: block;
                }

                .sb-drag-handle {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: 26px;
                    height: 26px;
                    background: rgba(255,255,255,0.85);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: grab;
                    font-size: 13px;
                    color: #888;
                }

                .sb-drag-handle:active { cursor: grabbing; }

                .sb-card-body {
                    padding: 12px 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .sb-card-title {
                    font-size: 0.88rem;
                    font-weight: 500;
                    color: #1a1a1a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* ── Empty state ── */
                .sb-empty {
                    text-align: center;
                    padding: 5rem 2rem;
                    color: #bbb;
                }

                .sb-empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .sb-empty h3 {
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: #888;
                    margin-bottom: 6px;
                }

                .sb-empty p { font-size: 0.88rem; }

                /* ── Modal backdrop ── */
                .sb-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    z-index: 200;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }

                /* ── Modal card ── */
                .sb-modal {
                    background: #fff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 520px;
                    max-height: 88vh;
                    overflow-y: auto;
                    padding: 1.75rem;
                }

                .sb-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                }

                .sb-modal-header h2 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .sb-modal-close {
                    background: none;
                    border: none;
                    font-size: 1.3rem;
                    cursor: pointer;
                    color: #aaa;
                    line-height: 1;
                    padding: 2px 6px;
                }

                .sb-modal-close:hover { color: #444; }

                /* ── Upload drop zone ── */
                .sb-drop-zone {
                    border: 2px dashed #E5E5E2;
                    border-radius: 12px;
                    padding: 2.5rem 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.18s, background 0.18s;
                    margin-bottom: 1.25rem;
                }

                .sb-drop-zone.active {
                    border-color: #C1121F;
                    background: #FFF8F8;
                }

                .sb-drop-zone:hover { border-color: #C1121F; }

                .sb-drop-zone-icon { font-size: 2.2rem; margin-bottom: 10px; opacity: 0.6; }

                .sb-drop-zone p { font-size: 0.9rem; color: #888; }

                .sb-drop-zone span { color: #C1121F; font-weight: 500; cursor: pointer; }

                /* ── Pending files list ── */
                .sb-pending-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 1.25rem;
                    max-height: 260px;
                    overflow-y: auto;
                }

                .sb-pending-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #FAFAF9;
                    border: 1px solid #EEECEA;
                    border-radius: 10px;
                    padding: 10px 12px;
                }

                .sb-pending-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    object-fit: cover;
                    flex-shrink: 0;
                }

                .sb-pending-input {
                    flex: 1;
                    border: 1.5px solid #E5E5E2;
                    border-radius: 8px;
                    padding: 7px 10px;
                    font-size: 0.88rem;
                    font-family: inherit;
                    color: #1a1a1a;
                    outline: none;
                }

                .sb-pending-input:focus { border-color: #C1121F; }

                .sb-pending-remove {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #ccc;
                    font-size: 1rem;
                    padding: 2px;
                }

                .sb-pending-remove:hover { color: #C1121F; }

                /* ── Edit modal image ── */
                .sb-edit-img-wrap {
                    position: relative;
                    aspect-ratio: 16/9;
                    border-radius: 10px;
                    overflow: hidden;
                    background: #F0EFED;
                    margin-bottom: 1.25rem;
                    cursor: pointer;
                }

                .sb-edit-img-wrap img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sb-edit-img-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.18s;
                    font-size: 0.88rem;
                    color: #fff;
                    font-weight: 500;
                    gap: 6px;
                }

                .sb-edit-img-wrap:hover .sb-edit-img-overlay { background: rgba(0,0,0,0.45); }

                /* ── Form elements in modal ── */
                .sb-modal-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    display: block;
                    margin-bottom: 5px;
                }

                .sb-modal-input {
                    width: 100%;
                    padding: 0.7rem 1rem;
                    border: 1.5px solid #E5E5E2;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    color: #1a1a1a;
                    outline: none;
                    margin-bottom: 1.25rem;
                }

                .sb-modal-input:focus { border-color: #C1121F; box-shadow: 0 0 0 3px rgba(193,18,31,0.08); }

                .sb-modal-footer {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 0.5rem;
                }

                /* ── Delete confirm ── */
                .sb-delete-body {
                    text-align: center;
                    padding: 0.5rem 0 1rem;
                }

                .sb-delete-body .icon { font-size: 2.5rem; margin-bottom: 12px; }

                .sb-delete-body h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 6px;
                }

                .sb-delete-body p { font-size: 0.88rem; color: #aaa; }

                @media (max-width: 600px) {
                    .sb-main { padding: 1.25rem; }
                    .sb-toolbar { flex-direction: column; align-items: flex-start; }
                }
            `}</style>

            {/* ── Navbar ── */}
            <nav className="sb-nav">
                <div className="sb-nav-logo">
                    Slidebox<span className="sb-nav-logo-dot" />
                </div>
                <div className="sb-nav-right">
                    <div className="sb-avatar" title="My account">U</div>
                    <button
                        className="sb-btn sb-btn-ghost"
                        onClick={() => navigate("/signin")}
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            {/* ── Main ── */}
            <main className="sb-main">

                {/* Toolbar */}
                <div className="sb-toolbar">
                    <div className="sb-toolbar-left">
                        <h1>My Gallery</h1>
                        <p>{images.length} image{images.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="sb-toolbar-right">
                        {isRearranging ? (
                            <>
                                {selectedCount > 0 && (
                                    <button className="sb-btn sb-btn-danger" onClick={handleDeleteSelected}>
                                        🗑 Delete selected ({selectedCount})
                                    </button>
                                )}
                                <button className="sb-btn sb-btn-outline" onClick={() => { setIsRearranging(false); clearSelection(); }}>
                                    ✓ Done
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="sb-btn sb-btn-outline" onClick={() => setIsRearranging(true)}>
                                    ⇅ Rearrange
                                </button>
                                <button className="sb-btn sb-btn-primary" onClick={() => setUploadModal(true)}>
                                    + Upload
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Rearrange instructions */}
                {isRearranging && (
                    <div className="sb-rearrange-banner">
                        <div>
                            <p>Rearrange mode active — drag cards to reorder</p>
                            <span>Click cards to select them for bulk delete</span>
                        </div>
                        <button className="sb-btn sb-btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => { setIsRearranging(false); clearSelection(); }}>
                            Cancel
                        </button>
                    </div>
                )}

                {/* Gallery grid */}
                {images.length === 0 ? (
                    <div className="sb-empty">
                        <div className="sb-empty-icon">🖼</div>
                        <h3>No images yet</h3>
                        <p>Upload your first image to get started.</p>
                    </div>
                ) : (
                    <div className="sb-grid">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className={`sb-card${img.selected ? " selected" : ""}${draggingId === img.id ? " dragging" : ""}${dragOverId === img.id && draggingId !== img.id ? " drag-over" : ""}`}
                                draggable={isRearranging}
                                onDragStart={() => handleDragStart(img.id)}
                                onDragEnter={() => handleDragEnter(img.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(img.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => toggleSelect(img.id)}
                            >
                                <div className="sb-card-img-wrap">
                                    <img src={img.url} alt={img.title} loading="lazy" />
                                    <div className="sb-card-overlay">
                                        {!isRearranging && (
                                            <>
                                                <button
                                                    className="sb-card-action"
                                                    title="Edit"
                                                    onClick={(e) => { e.stopPropagation(); openEdit(img); }}
                                                >
                                                    ✏
                                                </button>
                                                <button
                                                    className="sb-card-action del"
                                                    title="Delete"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(img.id); }}
                                                >
                                                    🗑
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {isRearranging && (
                                        <>
                                            <div className="sb-drag-handle" title="Drag to reorder">⠿</div>
                                            <div
                                                className={`sb-card-check${img.selected ? " checked" : ""}`}
                                                style={{ left: "auto", right: 10 }}
                                                onClick={(e) => { e.stopPropagation(); toggleSelect(img.id); }}
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="sb-card-body">
                                    <span className="sb-card-title">{img.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Upload Modal ── */}
            {uploadModal && (
                <div className="sb-backdrop" onClick={() => { setUploadModal(false); setPendingFiles([]); }}>
                    <div className="sb-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sb-modal-header">
                            <h2>Upload images</h2>
                            <button className="sb-modal-close" onClick={() => { setUploadModal(false); setPendingFiles([]); }}>✕</button>
                        </div>

                        {/* Drop zone */}
                        <div
                            className={`sb-drop-zone${dragOver ? " active" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => uploadFileRef.current?.click()}
                        >
                            <div className="sb-drop-zone-icon">📁</div>
                            <p>Drop images here or <span>browse files</span></p>
                            <p style={{ fontSize: "0.78rem", marginTop: 4, color: "#ccc" }}>PNG, JPG, WEBP supported</p>
                        </div>
                        <input
                            ref={uploadFileRef}
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileInput}
                        />

                        {/* Pending files */}
                        {pendingFiles.length > 0 && (
                            <>
                                <div className="sb-pending-list">
                                    {pendingFiles.map((f, i) => (
                                        <div key={i} className="sb-pending-item">
                                            <img className="sb-pending-thumb" src={f.preview} alt="" />
                                            <input
                                                className="sb-pending-input"
                                                value={f.title}
                                                placeholder="Add a title…"
                                                onChange={(e) => updatePendingTitle(i, e.target.value)}
                                            />
                                            <button className="sb-pending-remove" onClick={() => removePending(i)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="sb-modal-footer">
                                    <button className="sb-btn sb-btn-outline" onClick={() => setPendingFiles([])}>Clear all</button>
                                    <button className="sb-btn sb-btn-primary" onClick={handleUploadSubmit}>
                                        Upload {pendingFiles.length} image{pendingFiles.length !== 1 ? "s" : ""}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {editModal && (
                <div className="sb-backdrop" onClick={() => setEditModal(null)}>
                    <div className="sb-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sb-modal-header">
                            <h2>Edit image</h2>
                            <button className="sb-modal-close" onClick={() => setEditModal(null)}>✕</button>
                        </div>

                        <div className="sb-edit-img-wrap" onClick={() => fileInputRef.current?.click()}>
                            <img src={editPreview} alt={editModal.title} />
                            <div className="sb-edit-img-overlay">📷 Change image</div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleEditFileChange}
                        />

                        <label className="sb-modal-label" htmlFor="edit-title">Title</label>
                        <input
                            id="edit-title"
                            className="sb-modal-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Image title"
                        />

                        <div className="sb-modal-footer">
                            <button className="sb-btn sb-btn-outline" onClick={() => setEditModal(null)}>Cancel</button>
                            <button className="sb-btn sb-btn-primary" onClick={handleEditSave}>Save changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteConfirm && (
                <div className="sb-backdrop" onClick={() => setDeleteConfirm(null)}>
                    <div className="sb-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
                        <div className="sb-delete-body">
                            <div className="icon">🗑</div>
                            <h3>Delete image?</h3>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="sb-modal-footer" style={{ justifyContent: "center" }}>
                            <button className="sb-btn sb-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="sb-btn sb-btn-danger" style={{ background: "#C1121F", color: "#fff" }} onClick={() => handleDelete(deleteConfirm)}>
                                Yes, delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}