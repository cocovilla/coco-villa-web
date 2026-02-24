const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary from env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * Files are stored under: cocovilla/web_images/<section>/
 * Returns { publicId, imageUrl }
 */
function uploadFileToCloudinary(buffer, filename, mimeType, section) {
    return new Promise((resolve, reject) => {
        const folder = `cocovilla/web_images/${section}`;
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    publicId: result.public_id,
                    imageUrl: result.secure_url,
                });
            }
        );
        uploadStream.end(buffer);
    });
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
async function deleteFileFromCloudinary(publicId) {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Failed to delete Cloudinary file:', publicId, err.message);
    }
}

/**
 * List all images in cocovilla/web_images/<section>/ on Cloudinary.
 * Returns array of { publicId, imageUrl }
 */
async function listFilesInSection(section) {
    const folder = `cocovilla/web_images/${section}`;
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: 100,
        });
        return (result.resources || []).map(r => ({
            publicId: r.public_id,
            imageUrl: r.secure_url,
        }));
    } catch (err) {
        console.error(`Failed to list Cloudinary files for ${section}:`, err.message);
        return [];
    }
}

module.exports = { uploadFileToCloudinary, deleteFileFromCloudinary, listFilesInSection };
