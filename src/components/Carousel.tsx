import React, {useState, useEffect, useCallback, WheelEvent, TouchEvent} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useIsPortrait} from '../hooks/use-is-portrait.hook';

import './Carousel.css';

interface CarouselProps {
    images: string[];
    preloadCount?: number;
    initialIndex?: number;
}

const SWIPE_THRESHOLD = 50;

export const Carousel = ({images, preloadCount = 10, initialIndex = 0}: CarouselProps) => {
    const [startIndex, setStartIndex] = useState(0);
    const [loaded, setLoaded] = useState<Record<string, boolean>>({});
    const [failed, setFailed] = useState<Record<string, boolean>>({});
    const [touchStart, setTouchStart] = useState<{x: number; y: number} | null>(null);
    const isPortrait = useIsPortrait();

    useEffect(() => {
        if (images.length < 3) {
            return;
        }

        if (initialIndex >= 0 && initialIndex < images.length) {
            setStartIndex(initialIndex);
        } else {
            setStartIndex(0);
        }
    }, [images, initialIndex]);

    const getVisibleImages = useCallback(() => {
        if (images.length < 3) {
            return images;
        }

        return [
            images[(startIndex - 1 + images.length) % images.length],
            images[startIndex],
            images[(startIndex + 1) % images.length]
        ];
    }, [images, startIndex]);

    const moveNext = () => {
        setStartIndex(prev => (prev + 1) % images.length);
    };

    const movePrev = () => {
        setStartIndex(prev => (prev - 1 + images.length) % images.length);
    };

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        if (images.length < 3) {
            return;
        }

        e.deltaY > 0 ? moveNext() : movePrev();
    };

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        setTouchStart({x: touch.clientX, y: touch.clientY});
    };

    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (!touchStart) {
            return;
        }

        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStart.x;
        const dy = touch.clientY - touchStart.y;

        if (isPortrait) {
            if (Math.abs(dy) > SWIPE_THRESHOLD) {
                if (dy < 0) {
                    moveNext();
                } else {
                    movePrev();
                }
            }
        } else {
            if (Math.abs(dx) > SWIPE_THRESHOLD) {
                if (dx < 0) {
                    moveNext();
                } else {
                    movePrev();
                }
            }
        }

        setTouchStart(null);
    };

    const handleImageLoad = (src: string) => {
        setLoaded(prev => ({...prev, [src]: true}));
        setFailed(prev => ({...prev, [src]: false}));
    };

    const handleImageError = (src: string) => {
        setFailed(prev => ({...prev, [src]: true}));
    };

    const createImage = (src: string) => {
        const img = new Image();
        img.src = src;
        img.onload = () => handleImageLoad(src);
        img.onerror = () => handleImageError(src);
    };

    const retryImage = (src: string) => {
        setFailed(prev => ({...prev, [src]: false}));
        setLoaded(prev => ({...prev, [src]: false}));

        createImage(src);
    };

    useEffect(() => {
        if (images.length === 0) {
            return;
        }

        const preloadImages: string[] = [];
        for (let i = 1; i <= preloadCount; i++) {
            const next = images[(startIndex + 1 + i) % images.length];
            const prev = images[(startIndex - 1 - i + images.length) % images.length];
            preloadImages.push(next, prev);
        }

        preloadImages.forEach(src => {
            if (!loaded[src] && !failed[src]) {
                createImage(src);
            }
        });
    }, [startIndex, preloadCount, images, loaded, failed]);

    const visibleImages = getVisibleImages();
    const containerClass = `carousel ${isPortrait ? 'portrait' : 'landscape'}`;

    return (
        <div
            className={containerClass}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {visibleImages.map((src, idx) => {
                const isCenter = idx === 1;

                const isLoaded = loaded[src];
                const isFailed = failed[src];

                const imageContainerClass = `carousel-item ${isCenter ? 'center' : 'side'} ${
                    isPortrait ? 'portrait' : 'landscape'
                }`;
                const errorMessageClass = `error-message ${isPortrait ? 'portrait' : 'landscape'}`;
                const imageClass = `carousel-image ${isCenter ? 'center' : 'side'} ${
                    isLoaded ? 'visible' : 'invisible'
                }`;

                let objectPosition = 'center';
                if (isPortrait) {
                    if (!isCenter) objectPosition = idx === 0 ? 'bottom' : 'top';
                } else {
                    if (!isCenter) objectPosition = idx === 0 ? 'right' : 'left';
                }

                return (
                    <AnimatePresence key={src}>
                        <motion.div
                            className={imageContainerClass}
                            initial={{opacity: 0, y: isPortrait ? 20 : 0, x: isPortrait ? 0 : 20}}
                            animate={{opacity: 1, y: 0, x: 0}}
                            exit={{opacity: 0, y: isPortrait ? -20 : 0, x: isPortrait ? 0 : -20}}
                        >
                            {!isLoaded && !isFailed && (
                                <div className="loader">
                                    <div className="spinner" />
                                </div>
                            )}

                            {isFailed && (
                                <div className={errorMessageClass}>
                                    <span>Loading failed</span>
                                    <button className="retry-button" onClick={() => retryImage(src)}>
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isFailed && (
                                <img
                                    src={src}
                                    alt={`carousel-${idx}`}
                                    className={imageClass}
                                    style={{objectPosition}}
                                    onLoad={() => handleImageLoad(src)}
                                    onError={() => handleImageError(src)}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                );
            })}
        </div>
    );
};
