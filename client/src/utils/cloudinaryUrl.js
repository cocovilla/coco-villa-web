/**
 * Transforms a Cloudinary image URL to use:
 *  - f_auto  → serves WebP or AVIF instead of JPEG/PNG (30–70% smaller, same quality)
 *  - q_auto  → Cloudinary AI picks the optimal quality (no visible degradation)
 *  - w_[width] (optional) → resize to display width to avoid sending a 4000px image for a 400px card
 *
 * Non-Cloudinary URLs (local paths, Unsplash, etc.) are returned unchanged.
 */
export function cloudinaryUrl(url, { width } = {}) {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const transforms = ['f_auto', 'q_auto'];
    if (width) transforms.push(`w_${width}`);

    // Insert transforms after /upload/
    return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
