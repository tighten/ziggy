// Decode valid percent-encoded sequences, leave anything malformed as-is
export function decode(value) {
    return value.replace(/(%[0-9a-f]{2})+/gi, (encoded) => {
        try {
            return decodeURIComponent(encoded);
        } catch {
            return encoded;
        }
    });
}
