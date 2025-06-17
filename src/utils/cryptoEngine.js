/**
 * SecureCipher Crypto Engine - Frontend Implementation
 * Handles all cryptographic operations for secure banking
 */

class SecureCipherEngine {
    constructor() {
        this.dbName = "SecureCipherKeys";
        this.dbVersion = 1;
        this.keyStore = "keys";
        this.initDB();
    }

    /**
     * Initialize IndexedDB for secure key storage
     * 
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.keyStore)) {
                    db.createObjectStore(this.keyStore);
                }
            };
        });
    }

    /**
     * Generate ECDSA P-384 key pair for user authentication
     */
    async generateKeyPair() {
        try {
            console.log('🔐 Generating ECDSA P-384 key pair...');
            
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "ECDSA",
                    namedCurve: "P-384"
                },
                true,  // Extractable for storage
                ["sign", "verify"]
            );
            
            await this.storeKeyPair(keyPair);
            console.log('✅ Key pair generated and stored successfully');
            return keyPair;
        } catch (error) {
            console.error("❌ Key generation failed:", error);
            throw new Error("Failed to generate cryptographic keys");
        }
    }

    /**
     * Store key pair securely in IndexedDB
     */
    async storeKeyPair(keyPair) {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readwrite");
            const store = transaction.objectStore(this.keyStore);
            
            // Export and store private key
            const privateKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
            store.put(privateKeyJWK, "ecdsa_private_key");
            
            // Export and store public key
            const publicKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
            store.put(publicKeyJWK, "ecdsa_public_key");
            
            // Store key metadata
            store.put({
                created: new Date().toISOString(),
                algorithm: "ECDSA",
                curve: "P-384",
                fingerprint: await this.generateFingerprint(publicKeyJWK)
            }, "key_metadata");
            
            return true;
        } catch (error) {
            console.error("❌ Key storage failed:", error);
            throw new Error("Failed to store cryptographic keys");
        }
    }

    /**
     * Generate fingerprint for public key identification
     */
    async generateFingerprint(publicKeyJWK) {
        try {
            const keyString = JSON.stringify(publicKeyJWK, Object.keys(publicKeyJWK).sort());
            const encoder = new TextEncoder();
            const data = encoder.encode(keyString);
            
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex.substr(0, 16); // First 16 chars as fingerprint
        } catch (error) {
            console.error("❌ Fingerprint generation failed:", error);
            return 'unknown';
        }
    }

    /**
     * Retrieve stored private key
     */
    async getPrivateKey() {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readonly");
            const store = transaction.objectStore(this.keyStore);
            
            return new Promise((resolve, reject) => {
                const request = store.get("ecdsa_private_key");
                request.onsuccess = async () => {
                    if (request.result) {
                        const privateKey = await window.crypto.subtle.importKey(
                            "jwk",
                            request.result,
                            { name: "ECDSA", namedCurve: "P-384" },
                            false,
                            ["sign"]
                        );
                        resolve(privateKey);
                    } else {
                        reject(new Error("Private key not found"));
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("❌ Private key retrieval failed:", error);
            throw new Error("Failed to retrieve private key");
        }
    }

    /**
     * Retrieve stored public key
     */
    async getPublicKey() {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readonly");
            const store = transaction.objectStore(this.keyStore);
            
            return new Promise((resolve, reject) => {
                const request = store.get("ecdsa_public_key");
                request.onsuccess = async () => {
                    if (request.result) {
                        const publicKey = await window.crypto.subtle.importKey(
                            "jwk",
                            request.result,
                            { name: "ECDSA", namedCurve: "P-384" },
                            false,
                            ["verify"]
                        );
                        resolve(publicKey);
                    } else {
                        reject(new Error("Public key not found"));
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("❌ Public key retrieval failed:", error);
            throw new Error("Failed to retrieve public key");
        }
    }

    /**
     * Sign data with ECDSA private key using SHA-384
     */
    async signData(data) {
        try {
            const privateKey = await this.getPrivateKey();
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data, Object.keys(data).sort()));
            
            const signature = await window.crypto.subtle.sign(
                {
                    name: "ECDSA",
                    hash: { name: "SHA-384" }
                },
                privateKey,
                dataBuffer
            );
            
            // Convert to base64 for transmission
            return btoa(String.fromCharCode(...new Uint8Array(signature)));
        } catch (error) {
            console.error("❌ Data signing failed:", error);
            throw new Error("Failed to sign data");
        }
    }

    /**
     * Generate AES-256-GCM key for encryption
     */
    async generateAESKey() {
        return await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    /**
     * Encrypt data with AES-256-GCM
     */
    async encryptData(data, key = null) {
        try {
            const aesKey = key || await this.generateAESKey();
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            // Generate random IV (12 bytes for GCM)
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                aesKey,
                dataBuffer
            );
            
            return {
                encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
                iv: btoa(String.fromCharCode(...iv)),
                key: await window.crypto.subtle.exportKey("jwk", aesKey)
            };
        } catch (error) {
            console.error("❌ Data encryption failed:", error);
            throw new Error("Failed to encrypt data");
        }
    }

    /**
     * Check if user has cryptographic keys
     */
    async hasKeys() {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readonly");
            const store = transaction.objectStore(this.keyStore);
            
            return new Promise((resolve) => {
                const request = store.get("key_metadata");
                request.onsuccess = () => resolve(!!request.result);
                request.onerror = () => resolve(false);
            });
        } catch (error) {
            return false;
        }
    }

    /**
     * Get user's public key for server registration
     */
    async getPublicKeyJWK() {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readonly");
            const store = transaction.objectStore(this.keyStore);
            
            return new Promise((resolve, reject) => {
                const request = store.get("ecdsa_public_key");
                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result);
                    } else {
                        reject(new Error("Public key not found"));
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("❌ Public key export failed:", error);
            throw new Error("Failed to export public key");
        }
    }

    /**
     * Get key fingerprint for identification
     */
    async getKeyFingerprint() {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readonly");
            const store = transaction.objectStore(this.keyStore);
            
            return new Promise((resolve, reject) => {
                const request = store.get("key_metadata");
                request.onsuccess = () => {
                    if (request.result && request.result.fingerprint) {
                        resolve(request.result.fingerprint);
                    } else {
                        reject(new Error("Fingerprint not found"));
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("❌ Fingerprint retrieval failed:", error);
            throw new Error("Failed to retrieve fingerprint");
        }
    }

    /**
     * Clear all stored keys (for testing or logout)
     */
    async clearKeys() {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.keyStore], "readwrite");
            const store = transaction.objectStore(this.keyStore);
            
            await store.clear();
            console.log('🗑️ All cryptographic keys cleared');
            return true;
        } catch (error) {
            console.error("❌ Key clearing failed:", error);
            return false;
        }
    }
}

export default SecureCipherEngine;
