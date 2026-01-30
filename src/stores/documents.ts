import { defineStore } from 'pinia';
import { apiGet, apiPost, apiDelete } from '../lib/api';

export interface ProjectDocument {
    id: string;
    planId: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    description?: string;
    uploadedAt: string;
}

interface DocumentsState {
    documents: ProjectDocument[];
    loading: boolean;
    error: string | null;
}

export const useDocumentsStore = defineStore('documents', {
    state: (): DocumentsState => ({
        documents: [],
        loading: false,
        error: null,
    }),

    getters: {
        getDocumentsByPlanId: (state) => (planId: string) => {
            return state.documents.filter(doc => doc.planId === planId);
        },
    },

    actions: {
        async fetchDocumentsForPlan(planId: string) {
            this.loading = true;
            this.error = null;
            try {
                const docs = await apiGet<ProjectDocument[]>(`/api/documents/plan/${planId}`);
                // Remove existing docs for this plan and add new ones
                this.documents = this.documents.filter(d => d.planId !== planId);
                this.documents.push(...docs);
            } catch (error: any) {
                this.error = error.message || 'Failed to fetch documents';
                console.error('Fetch documents error:', error);
            } finally {
                this.loading = false;
            }
        },

        async uploadDocument(planId: string, file: File, description?: string) {
            this.loading = true;
            this.error = null;
            try {
                // Convert file to base64
                const fileData = await this.fileToBase64(file);

                const doc = await apiPost<ProjectDocument>('/api/documents/upload', {
                    planId,
                    fileName: file.name,
                    fileType: file.type || this.getFileType(file.name),
                    fileData,
                    description,
                });

                this.documents.push(doc);
                return doc;
            } catch (error: any) {
                this.error = error.message || 'Failed to upload document';
                console.error('Upload document error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteDocument(documentId: string) {
            this.loading = true;
            this.error = null;
            try {
                await apiDelete(`/api/documents/${documentId}`);
                this.documents = this.documents.filter(d => d.id !== documentId);
            } catch (error: any) {
                this.error = error.message || 'Failed to delete document';
                console.error('Delete document error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Helper: convert file to base64
        async fileToBase64(file: File): Promise<string> {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        },

        // Helper: get file type from extension
        getFileType(fileName: string): string {
            const ext = fileName.split('.').pop()?.toLowerCase() || '';
            const types: Record<string, string> = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };
            return types[ext] || 'application/octet-stream';
        },

        // Format file size for display
        formatFileSize(bytes: number): string {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },
    },
});
