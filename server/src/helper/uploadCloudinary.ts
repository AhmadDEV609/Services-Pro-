
import type {
    UploadApiResponse,
    UploadApiErrorResponse,
} from "cloudinary";

import cloudinary from "./cloudinary.js";

const uploadToCloudinary = (
    buffer: Buffer,
    folder: string
): Promise<UploadApiResponse> => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined
            ) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary upload returned no result"));
                    return;
                }

                resolve(result);
            }
        );

        stream.end(buffer);
    });
};

export default uploadToCloudinary;
