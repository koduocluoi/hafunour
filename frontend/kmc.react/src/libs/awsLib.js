import { Storage } from "aws-amplify";

export async function s3Upload(file, fileName) {
    const stored = await Storage.vault.put(fileName, file, {
        contentType: file.type,
    });

    return stored.key;
}
