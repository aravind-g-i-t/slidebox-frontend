import { useState, useRef, useEffect, useCallback, type DragEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../redux/store";
import { deleteImage, getImages, reArrangeImages, updateImageFile, updateImageTitle, uploadImages } from "../services/imageServices";
import { logout } from "../services/authServices";
import { clearUser } from "../redux/slices/userSlice";
import { AxiosError } from "axios";
import imageCompression from "browser-image-compression";

interface ImageItem {
    id: string;
    title: string;
    imageUrl: string;
    order: number;
    createdAt: Date;
}

interface NewImage {
    file: File;
    preview: string;
    title: string;
}

const MOCK_IMAGES: ImageItem[] = [];

export default function HomePage() {
    const user = useSelector((state: RootState) => state.user.user)!;
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [images, setImages] = useState<ImageItem[]>(MOCK_IMAGES);
    const [uploadModal, setUploadModal] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<NewImage[]>([]);
    const uploadFileRef = useRef<HTMLInputElement>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [draggingItem, setDraggingItem] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null)
    const [isTitleEditable, setIsTitleEditable] = useState(false);
    const [deleteingId, setDeletingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const loaderRef = useRef<HTMLDivElement | null>(null)
    const limit = 20;

    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        return await imageCompression(file, options);
    };

    const formatFileSize = (bytes: number) => {
        const kb = bytes / 1024;

        if (kb < 1024) {
            return `${kb.toFixed(1)} KB`;
        }

        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const fetchImages = useCallback(async () => {

        if (loading || !hasMore || fetchError) return;

        try {
            setLoading(true);
            setFetchError(false);

            const result = await dispatch(
                getImages({
                    limit,
                    skip: images.length,
                })
            ).unwrap();

            const newImages = result.data.images;

            setImages((prev) => [...prev, ...newImages]);
            setTotalCount(result.data.totalCount);

            if (
                newImages.length === 0 ||
                images.length + newImages.length >= result.data.totalCount
            ) {
                setHasMore(false);
            }

        } catch (error) {
            console.log(error);
            setFetchError(true);

        } finally {
            setLoading(false);
        }

    }, [dispatch, images.length, loading, hasMore, fetchError]);

    useEffect(() => {
        const currentLoader = loaderRef.current;

        if (!currentLoader) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];

                if (firstEntry.isIntersecting) {
                    fetchImages();
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0,
            }
        );

        observer.observe(currentLoader);

        return () => {
            observer.disconnect();
        };
    }, [fetchImages]);

    const addFilePreviews = async (files: File[]) => {
        setIsCompressing(true);
        for (const file of files) {
            const compressedFile = await compressImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPendingFiles((prev) => [
                    ...prev,
                    {
                        file: compressedFile,
                        preview: ev.target?.result as string,
                        title: file.name.replace(/\.[^.]+$/, ""),
                    },
                ]);
            };
            reader.readAsDataURL(compressedFile);
        }
        setIsCompressing(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        addFilePreviews(files);
    };

    const updatePendingTitle = (index: number, title: string) => {
        setPendingFiles((prev) => prev.map((f, i) => (i === index ? { ...f, title } : f)));
    };

    const removePending = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsUploading(true)
        const formData = new FormData();
        formData.append("metadatas", JSON.stringify(pendingFiles.map((item) => ({ title: item.title }))));
        pendingFiles.forEach((item) => formData.append("images", item.file));

        const result = await dispatch(uploadImages(formData)).unwrap();
        setIsUploading(false)
        setImages((prev) => [...result.data.images, ...prev]);
        setTotalCount((prev) => prev + result.data.images.length);
        setPendingFiles([]);
        setUploadModal(false);

    };

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
        } catch (error) {
            if (error instanceof AxiosError) console.log(error.message);
        } finally {
            dispatch(clearUser());
            // navigate("/");
        }
    };

    const handleDrag = (e: DragEvent, id: string) => {
        e.preventDefault();
        setDraggingItem(id)
    }

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    }

    const handleDrop = async (targetId: string, targetOrder: number) => {
        if (!draggingItem || draggingItem === targetId) return;

        try {

            await dispatch(reArrangeImages({ draggedId: draggingItem, targetOrder })).unwrap();

            setImages((prev) => {
                const updated = [...prev];

                const draggedIndex = updated.findIndex(
                    (img) => img.id === draggingItem
                );

                const targetIndex = updated.findIndex(
                    (img) => img.id === targetId
                );

                if (draggedIndex === -1 || targetIndex === -1) {
                    return prev;
                }

                const [draggedItem] = updated.splice(draggedIndex, 1);

                updated.splice(targetIndex, 0, draggedItem);

                const ordered = updated.map((img, index) => ({
                    ...img,
                    order: totalCount - index - 1,
                }));
                return ordered

            });
        } catch (error) {
            console.log(error as string);

        } finally {
            setDraggingItem(null);
        };
    }

    const handleSelect = (img: ImageItem) => {
        setSelectedImage(img);
        setEditTitle(img.title);
        setEditFile(null)
    }

    const handleNext = () => {
        if (!selectedImage) return;
        const currentIndex = images.findIndex(img => img.id === selectedImage.id);
        const nextIndex = (currentIndex + 1) % images.length;
        setSelectedImage(images[nextIndex]);
        setEditTitle(images[nextIndex].title);
        setEditFile(null);
    }

    const handlePrev = () => {
        if (!selectedImage) return;
        const currentIndex = images.findIndex(img => img.id === selectedImage.id);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setSelectedImage(images[prevIndex]);
        setEditTitle(images[prevIndex].title);
        setEditFile(null);
    }

    const handleUpdateTitle = async () => {
        if (!selectedImage) return;
        await dispatch(updateImageTitle({ imageId: selectedImage.id, title: editTitle.trim() })).unwrap();
        setImages(prev =>
            prev.map(img =>
                img.id === selectedImage.id ? { ...img, title: editTitle } : img
            )
        );
        setSelectedImage(prev => prev ? { ...prev, title: editTitle } : null);

    }

    const handleUpdateImage = async () => {
        if (!selectedImage || !editFile) return;
        const formData = new FormData();
        formData.append("image", editFile);
        const result = await dispatch(updateImageFile({ imageId: selectedImage.id, data: formData })).unwrap();
        const newUrl = result.data.imageUrl;
        setImages(prev =>
            prev.map(img =>
                img.id === selectedImage.id ? { ...img, imageUrl: newUrl } : img
            )
        );
        setSelectedImage(prev => prev ? { ...prev, imageUrl: newUrl } : null);
        setEditFile(null);
    };

    const handleDelete = async () => {
        if (!deleteingId) return;
        await dispatch(deleteImage({ imageId: deleteingId })).unwrap();
        setDeletingId(null);
        setImages(prev => prev.filter(img => img.id !== deleteingId));
        setTotalCount(prev => prev - 1);
    };

    if (!user) {
        navigate("/")
    }


    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans">

            {/* Navbar */}
            <nav className="bg-white border-b border-[#EEECEA] px-8 h-[62px] flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center font-serif text-[1.55rem] font-bold text-[#C1121F] tracking-tight">
                    Slidebox
                    <span className="w-[7px] h-[7px] bg-[#C1121F] rounded-full ml-[3px] mb-3 inline-block" />
                </div>
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-9 h-9 bg-[#C1121F] rounded-full flex items-center justify-center text-white text-[0.8rem] font-semibold cursor-pointer"
                        title="My account"
                    >
                        {user.name[0].toUpperCase()}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 h-9 rounded-lg text-[0.85rem] font-medium cursor-pointer inline-flex items-center gap-1.5 transition-all border border-transparent bg-transparent text-[#888] hover:bg-[#F5F4F2] hover:text-[#444]"
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Main */}
            <main className="px-8 py-8 max-w-[1200px] mx-auto">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">My Gallery</h1>
                        <p className="text-[0.85rem] text-[#aaa] mt-0.5">
                            {totalCount} image{totalCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <button
                            className="px-4 h-9 rounded-lg text-[0.85rem] font-medium cursor-pointer inline-flex items-center gap-1.5 transition-all border border-[#C1121F] bg-[#C1121F] text-white hover:bg-[#A50F1A] hover:border-[#A50F1A]"
                            onClick={() => setUploadModal(true)}
                        >
                            + Upload
                        </button>
                    </div>
                </div>

                {/* Gallery or Empty State */}
                {images.length === 0 ? (
                    <div className="text-center py-20 px-8 text-[#bbb]">
                        <div className="text-5xl mb-4 opacity-50">🖼</div>
                        <h3 className="text-[1.1rem] font-medium text-[#888] mb-1.5">No images yet</h3>
                        <p className="text-[0.88rem]">Upload your first image to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                        {images.map((img) => (
                            <div
                                draggable
                                onDrag={(e) => handleDrag(e, img.id)}
                                onDragOver={e => handleDragOver(e)}
                                onDrop={() => handleDrop(img.id, img.order)}
                                onClick={() => handleSelect(img)}
                                className="group bg-white border border-[#EEECEA] rounded-2xl overflow-hidden transition-all duration-200 cursor-default hover:border-[#E0DEDA] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
                            >
                                {/* Image wrapper */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EFED]">
                                    <img
                                        src={img.imageUrl}
                                        alt={img.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.18] transition-all duration-200 flex items-start justify-end p-2.5 gap-1.5">
                                        {/* <button
                                            className="w-[30px] h-[30px] rounded-lg border-none bg-white/90 text-[#444] flex items-center justify-center cursor-pointer text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                                            title="Edit"
                                        >
                                            ✏
                                        </button> */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingId(img.id);
                                            }}
                                            className="w-[30px] h-[30px] rounded-lg border-none bg-white/90 text-[#444] flex items-center justify-center cursor-pointer text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#C1121F] hover:text-white"
                                            title="Delete"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="px-3.5 py-3 flex items-center justify-between gap-2">
                                    <span className="text-[0.88rem] font-medium text-[#1a1a1a] truncate">
                                        {img.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={loaderRef} className="h-10 flex items-center justify-center">
                    {loading && <p>Loading...</p>}
                    {fetchError && (
                        <button
                            onClick={() => setFetchError(false)}
                            className="px-4 py-2 border rounded"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </main>

            {/* Upload Modal */}
            {uploadModal && (
                <div
                    className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-4"
                    onClick={() => { setUploadModal(false); setPendingFiles([]); }}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-[500px] border border-[#EEECEA] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#EEECEA] flex items-center justify-between">
                            <div>
                                <p className="text-[1rem] font-medium text-[#1a1a1a] m-0">Upload images</p>
                                <p className="text-[0.75rem] text-[#aaa] mt-0.5 m-0">JPEG, PNG, WebP — up to 10MB each</p>
                            </div>
                            <button
                                onClick={() => { if (!isCompressing) { setUploadModal(false); setPendingFiles([]); } }}
                                disabled={isCompressing}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#aaa] hover:text-[#444] hover:bg-[#F5F4F2] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            {/* Drop zone */}
                            <label className={`block border-[1.5px] border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isCompressing
                                ? "border-[#C1121F] bg-[#FFF8F8]"
                                : "border-[#D5D3D0] bg-[#FAFAF9] hover:border-[#C1121F] hover:bg-[#FFF8F8]"
                                }`}>
                                {isCompressing ? (
                                    <>
                                        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                                            <svg className="animate-spin h-5 w-5 text-[#C1121F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        </div>
                                        <p className="text-[0.88rem] font-medium text-[#C1121F] mb-1">Compressing images…</p>
                                        <p className="text-[0.78rem] text-[#aaa]">This may take a moment for large files</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                                            <span className="text-blue-500 text-xl">↑</span>
                                        </div>
                                        <p className="text-[0.88rem] font-medium text-[#1a1a1a] mb-1">Drop images here</p>
                                        <p className="text-[0.78rem] text-[#aaa] mb-3">or click to browse your files</p>
                                        <span className="inline-block text-[0.8rem] px-4 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
                                            Choose files
                                        </span>
                                    </>
                                )}
                                <input
                                    ref={uploadFileRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                    disabled={isCompressing}
                                />
                            </label>

                            {/* Pending files */}
                            {pendingFiles.length > 0 && (
                                <div className="flex flex-col gap-2 mt-4 max-h-[220px] overflow-y-auto">
                                    {pendingFiles.map((f, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2.5 bg-[#FAFAF9] border border-[#EEECEA] rounded-xl px-2.5 py-2"
                                        >
                                            <img
                                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                                                src={f.preview}
                                                alt=""
                                            />
                                            <input
                                                className="flex-1 min-w-0 border border-[#E5E5E2] rounded-lg px-2.5 py-1.5 text-[0.82rem] text-[#1a1a1a] outline-none focus:border-[#C1121F] bg-white"
                                                value={f.title}
                                                placeholder="Add a title…"
                                                onChange={e => updatePendingTitle(i, e.target.value)}
                                            />
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className="text-[0.72rem] text-[#bbb]">
                                                    {formatFileSize(f.file.size)}
                                                </span>
                                                <button
                                                    onClick={() => removePending(i)}
                                                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#ccc] hover:text-[#C1121F] hover:bg-[#FFF8F8] transition-all text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {pendingFiles.length > 0 && (
                            <div className="px-6 py-3.5 border-t border-[#EEECEA] flex items-center justify-between">
                                <span className="text-[0.75rem] text-[#aaa]">
                                    {pendingFiles.length} image{pendingFiles.length !== 1 ? "s" : ""} ·{" "}
                                    {(pendingFiles.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(1)} MB total
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPendingFiles([])}
                                        disabled={isCompressing}
                                        className="px-3.5 h-8 rounded-lg text-[0.82rem] font-medium border border-[#E5E5E2] bg-white text-[#666] hover:border-[#C1121F] hover:text-[#C1121F] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Clear all
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isUploading}
                                        className="px-4 h-8 rounded-lg text-[0.82rem] font-medium bg-[#C1121F] text-white hover:bg-[#A50F1A] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isUploading && (
                                            <svg
                                                className="animate-spin h-3.5 w-3.5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                        )}
                                        {isUploading
                                            ? "Uploading..."
                                            : `Upload ${pendingFiles.length} image${pendingFiles.length !== 1 ? "s" : ""}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Preview / Edit Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEECEA]">
                            <h2 className="text-[1.1rem] font-bold text-[#1a1a1a] truncate">{selectedImage.title}</h2>
                            <button
                                className="text-[1.2rem] text-[#aaa] hover:text-[#444] px-1"
                                onClick={() => setSelectedImage(null)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Image + nav */}
                        <div className="relative bg-[#F0EFED] flex items-center justify-center" style={{ minHeight: 320 }}>
                            {/* Prev */}
                            <button
                                onClick={handlePrev}
                                className="absolute left-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#444] text-lg"
                                title="Previous"
                            >
                                ‹
                            </button>

                            <img
                                src={editFile ? URL.createObjectURL(editFile) : selectedImage.imageUrl}
                                alt={selectedImage.title}
                                className="max-h-[400px] max-w-full object-contain rounded"
                            />

                            {/* Next */}
                            <button
                                onClick={handleNext}
                                className="absolute right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#444] text-lg"
                                title="Next"
                            >
                                ›
                            </button>
                        </div>

                        {/* Edit panels */}
                        <div className="px-6 py-5 flex flex-col gap-5">

                            {/* Update title */}
                            {/* Update title */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.8rem] font-semibold text-[#888] uppercase tracking-wide">
                                    Title
                                </label>
                                <div className="flex gap-2">
                                    {isTitleEditable ? (
                                        <input
                                            autoFocus
                                            className="flex-1 border border-[#E5E5E2] rounded-lg px-3 py-2 text-[0.88rem] text-[#1a1a1a] outline-none focus:border-[#C1121F]"
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            placeholder="Image title"
                                        />
                                    ) : (
                                        <span className="flex-1 px-3 py-2 text-[0.88rem] text-[#1a1a1a] border border-transparent rounded-lg bg-[#FAFAF9]">
                                            {editTitle}
                                        </span>
                                    )}

                                    {isTitleEditable ? (
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => { setEditTitle(selectedImage.title); setIsTitleEditable(false); }}
                                                className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#E5E5E2] bg-white text-[#444] hover:border-[#C1121F] hover:text-[#C1121F] transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => { await handleUpdateTitle(); setIsTitleEditable(false); }}
                                                disabled={editTitle === selectedImage.title || !editTitle.trim()}
                                                className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#C1121F] bg-[#C1121F] text-white hover:bg-[#A50F1A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsTitleEditable(true)}
                                            className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#E5E5E2] bg-white text-[#444] hover:border-[#C1121F] hover:text-[#C1121F] transition-all"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Replace image */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.8rem] font-semibold text-[#888] uppercase tracking-wide">
                                    Replace image
                                </label>
                                <div className="flex gap-2 items-center flex-wrap">
                                    <label className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#E5E5E2] bg-white text-[#444] hover:border-[#C1121F] hover:text-[#C1121F] cursor-pointer inline-flex items-center transition-all">
                                        Choose file
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) setEditFile(f);
                                            }}
                                        />
                                    </label>
                                    {editFile && (
                                        <>
                                            <span className="text-[0.82rem] text-[#888] truncate max-w-[160px]">{editFile.name}</span>
                                            <button
                                                onClick={handleUpdateImage}
                                                className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#C1121F] bg-[#C1121F] text-white hover:bg-[#A50F1A] transition-all"
                                            >
                                                Upload
                                            </button>
                                            <button
                                                onClick={() => setEditFile(null)}
                                                className="text-[#ccc] hover:text-[#C1121F] text-sm"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Index indicator */}
                            <p className="text-[0.8rem] text-[#bbb] text-center">
                                {images.findIndex(i => i.id === selectedImage.id) + 1} of {images.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {deleteingId && (
                <div
                    className="fixed inset-0 bg-black/70 z-[400] flex items-center justify-center p-4"
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4">Delete Image</h3>
                        <p className="text-[#666] mb-4">Are you sure you want to delete this image?</p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#E5E5E2] bg-white text-[#444] hover:border-[#C1121F] hover:text-[#C1121F] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 h-9 rounded-lg text-[0.85rem] font-medium border border-[#C1121F] bg-[#C1121F] text-white hover:bg-[#A50F1A] transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}